/**
 * AI-Powered Resume Parser using Watsonx Granite
 * Transforms unstructured resume text into structured JSON
 * 
 * Features:
 * - Text chunking for long resumes (10+ pages)
 * - Header/footer deduplication
 * - Prompt caching
 * - Result caching with MD5 hashing
 * - Smart routing (AI vs rule-based)
 * - Token usage tracking
 */

import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import { AIResumeOutput, ParsedResumeData } from '@/types/resume-parser.types';
import { ResumeCacheService } from './resumeCacheService';
import { TokenMetricsService } from './tokenMetricsService';
import { randomUUID } from 'crypto';

interface ResumeParserConfig {
  apiKey: string;
  projectId: string;
  serviceUrl: string;
  model: string;
}

interface ComplexityAnalysis {
  isComplex: boolean;
  reasons: string[];
  score: number;
}

interface ChunkResult {
  personalInfo: any;
  summary: string;
  workExperience: any[];
  education: any[];
  skills: string[];
  certifications: string[];
  projects: any[];
}

export class ResumeParserService {
  private watsonxClient: WatsonXAI | null = null;
  private config: ResumeParserConfig;
  private cache: ResumeCacheService;
  private metrics: TokenMetricsService;
  
  // Feature flags
  private readonly ENABLE_CHUNKING = process.env.ENABLE_TEXT_CHUNKING !== 'false';
  private readonly ENABLE_DEDUPLICATION = process.env.ENABLE_HEADER_DEDUPLICATION !== 'false';
  private readonly ENABLE_SMART_ROUTING = process.env.ENABLE_SMART_ROUTING !== 'false';
  private readonly MAX_RESUME_WORDS = parseInt(process.env.MAX_RESUME_WORDS || '4000');
  private readonly COMPLEXITY_THRESHOLD = parseInt(process.env.COMPLEXITY_THRESHOLD || '30');
  
  // Cached prompt components (for prompt caching optimization)
  private static readonly CACHED_SYSTEM_PROMPT = `You are a resume parsing expert. Extract structured data from the following resume text.

CRITICAL RULES:
1. Reconstruct broken entities (URLs, names split across lines)
2. Identify sections by context, not just headers
3. Consolidate multi-line fields into single entries
4. Extract ALL information present
5. Return ONLY valid JSON, no explanations`;

  private static readonly CACHED_SCHEMA = `
OUTPUT SCHEMA:
{
  "personal_info": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "location": "string",
    "github": "string",
    "portfolio": "string"
  },
  "summary": "string",
  "skills": ["string"],
  "work_experience": [{
    "company": "string",
    "title": "string",
    "duration": "string",
    "description": "string",
    "years_of_experience": number,
    "location": "string"
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "year": "string",
    "field": "string"
  }],
  "certifications": ["string"],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": ["string"]
  }]
}`;

  private static readonly CACHED_EXAMPLES = `
EXAMPLES:

Example 1 - Broken LinkedIn URL:
Input:
"Contact
anyaleannee@gmail.com
www.linkedin.com/in/tanya-leanne-
eti-76b38736b (LinkedIn)"

Output:
{
  "personal_info": {
    "email": "anyaleannee@gmail.com",
    "linkedin": "www.linkedin.com/in/tanya-leanne-eti-76b38736b"
  }
}

Example 2 - Misidentified Section:
Input:
"Contact
John Doe
Software Engineer
john@email.com"

Output:
{
  "personal_info": {
    "name": "John Doe",
    "email": "john@email.com"
  },
  "summary": "Software Engineer"
}`;
  
  constructor() {
    this.config = {
      apiKey: process.env.WATSONX_API_KEY || '',
      projectId: process.env.WATSONX_PROJECT_ID || '',
      serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
      model: process.env.WATSONX_MODEL_ID || 'meta-llama/llama-3-8b-instruct'
    };
    
    // Initialize cache and metrics services
    this.cache = new ResumeCacheService();
    this.metrics = new TokenMetricsService();
    
    // Only initialize if credentials are available
    if (this.config.apiKey && this.config.projectId) {
      try {
        this.watsonxClient = new WatsonXAI({
          version: '2023-05-29',
          serviceUrl: this.config.serviceUrl,
          authenticator: new IamAuthenticator({
            apikey: this.config.apiKey
          })
        });
        console.log('✅ Watsonx AI client initialized successfully');
        console.log('🔧 Optimizations enabled:', {
          chunking: this.ENABLE_CHUNKING,
          deduplication: this.ENABLE_DEDUPLICATION,
          smartRouting: this.ENABLE_SMART_ROUTING,
          caching: this.cache.getStats().enabled
        });
      } catch (error) {
        console.error('❌ Failed to initialize Watsonx client:', error);
      }
    } else {
      console.warn('⚠️  Watsonx credentials not configured, AI parsing will be unavailable');
    }
    
    // Start cleanup interval (every hour)
    setInterval(() => {
      this.cache.cleanup();
    }, 60 * 60 * 1000);
  }
  
  /**
   * Check if AI parsing is available
   */
  isAvailable(): boolean {
    return this.watsonxClient !== null && !!this.config.apiKey && !!this.config.projectId;
  }
  
  /**
   * Get cache service instance
   */
  getCache(): ResumeCacheService {
    return this.cache;
  }
  
  /**
   * Get metrics service instance
   */
  getMetrics(): TokenMetricsService {
    return this.metrics;
  }
  
  /**
   * Main entry point: Parse resume with all optimizations
   */
  async parseResumeOptimized(rawText: string, ruleBasedFallback?: () => any): Promise<AIResumeOutput> {
    const startTime = Date.now();
    const requestId = randomUUID();
    
    // Step 1: Check cache first
    const cached = this.cache.get(rawText);
    if (cached) {
      this.metrics.trackRequest({
        requestId,
        inputText: rawText,
        outputText: JSON.stringify(cached),
        parsingMethod: 'cached',
        processingTime: Date.now() - startTime
      });
      return cached;
    }
    
    // Step 2: Preprocess text (deduplication)
    let processedText = rawText;
    if (this.ENABLE_DEDUPLICATION) {
      processedText = this.deduplicateHeadersFooters(rawText);
    }
    
    // Step 3: Smart routing (complexity analysis)
    if (this.ENABLE_SMART_ROUTING && ruleBasedFallback) {
      const complexity = this.analyzeComplexity(processedText);
      
      if (!complexity.isComplex) {
        console.log(`📋 Simple resume detected (score: ${complexity.score})`);
        console.log('   Using rule-based parser...');
        
        const ruleBasedResult = ruleBasedFallback();
        
        // Convert rule-based result to AIResumeOutput format
        const aiFormatResult = this.convertRuleBasedToAIFormat(ruleBasedResult);
        
        // Track metrics
        this.metrics.trackRequest({
          requestId,
          inputText: rawText,
          outputText: JSON.stringify(aiFormatResult),
          parsingMethod: 'rule_based',
          processingTime: Date.now() - startTime
        });
        
        // Cache the result
        this.cache.set(rawText, aiFormatResult, 'rule_based');
        
        return aiFormatResult;
      }
      
      console.log(`🤖 Complex resume detected (score: ${complexity.score})`);
      console.log(`   Reasons: ${complexity.reasons.join(', ')}`);
    }
    
    // Step 4: Check if chunking is needed
    const wordCount = processedText.split(/\s+/).length;
    let result: AIResumeOutput;
    let parsingMethod: 'ai' | 'ai_chunked' = 'ai';
    
    if (this.ENABLE_CHUNKING && wordCount > this.MAX_RESUME_WORDS) {
      console.log(`⚠️ Long resume detected (${wordCount} words), using chunking strategy`);
      result = await this.parseResumeWithChunking(processedText);
      parsingMethod = 'ai_chunked';
    } else {
      result = await this.parseResume(processedText);
      parsingMethod = 'ai';
    }
    
    // Step 5: Cache result
    this.cache.set(rawText, result, parsingMethod);
    
    // Step 6: Track metrics
    this.metrics.trackRequest({
      requestId,
      inputText: rawText,
      outputText: JSON.stringify(result),
      parsingMethod,
      processingTime: Date.now() - startTime
    });
    
    return result;
  }
  
  /**
   * Convert rule-based parser result to AIResumeOutput format
   */
  private convertRuleBasedToAIFormat(ruleBasedResult: any): AIResumeOutput {
    return {
      personal_info: {
        name: ruleBasedResult.parsedSections?.personalInfo?.name || '',
        email: ruleBasedResult.parsedSections?.personalInfo?.email || '',
        phone: ruleBasedResult.parsedSections?.personalInfo?.phone || '',
        linkedin: ruleBasedResult.parsedSections?.personalInfo?.linkedin || '',
        location: ruleBasedResult.parsedSections?.personalInfo?.location || '',
        github: ruleBasedResult.parsedSections?.personalInfo?.github || '',
        portfolio: ruleBasedResult.parsedSections?.personalInfo?.portfolio || ''
      },
      summary: ruleBasedResult.parsedSections?.summary || '',
      skills: ruleBasedResult.parsedSections?.skills || [],
      work_experience: (ruleBasedResult.parsedSections?.workExperience || []).map((exp: any) => ({
        company: exp.company || '',
        title: exp.title || '',
        duration: exp.duration || '',
        description: exp.description || '',
        years_of_experience: exp.yearsOfExperience || 0,
        location: exp.location || ''
      })),
      education: (ruleBasedResult.parsedSections?.education || []).map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        year: edu.year || '',
        field: edu.field || ''
      })),
      certifications: ruleBasedResult.parsedSections?.certifications || [],
      projects: (ruleBasedResult.parsedSections?.projects || []).map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        technologies: proj.technologies || []
      }))
    };
  }
  
  /**
   * Analyze resume complexity to determine if AI parsing is needed
   */
  private analyzeComplexity(rawText: string): ComplexityAnalysis {
    const reasons: string[] = [];
    let score = 0;
    
    // Check resume length (longer resumes benefit from AI)
    const wordCount = rawText.split(/\s+/).length;
    const charCount = rawText.length;
    
    if (wordCount > 800) {
      reasons.push(`Long resume (${wordCount} words)`);
      score += 20;
    }
    
    if (charCount > 4000) {
      reasons.push(`Large text size (${charCount} characters)`);
      score += 15;
    }
    
    // Check for broken URLs (high complexity indicator)
    if (/https?:\/\/[^\s]+\n[^\s]+/.test(rawText)) {
      reasons.push('Broken URLs detected');
      score += 30;
    }
    
    // Check for multi-line fields (lines ending mid-word)
    const brokenLines = rawText.match(/\w+-\n\w+/g);
    if (brokenLines && brokenLines.length > 3) {
      reasons.push(`${brokenLines.length} broken lines detected`);
      score += 20;
    }
    
    // Check for unusual formatting (very short lines)
    const lines = rawText.split('\n');
    const shortLines = lines.filter(l => l.trim().length > 0 && l.trim().length < 20);
    if (shortLines.length > lines.length * 0.4) {
      reasons.push('Unusual formatting (many short lines)');
      score += 15;
    }
    
    // Check for missing section headers
    const hasSectionHeaders = /^(experience|education|skills|summary|work history|employment)/im.test(rawText);
    if (!hasSectionHeaders) {
      reasons.push('Missing clear section headers');
      score += 25;
    }
    
    // Check for non-standard date formats
    const hasStandardDates = /\d{4}\s*[-–]\s*\d{4}/.test(rawText);
    if (!hasStandardDates && rawText.length > 500) {
      reasons.push('Non-standard date formats');
      score += 10;
    }
    
    // Check for multiple work experiences (AI handles better)
    const workExpCount = (rawText.match(/\d{4}\s*[-–]\s*(?:\d{4}|present)/gi) || []).length;
    if (workExpCount > 3) {
      reasons.push(`Multiple work experiences (${workExpCount} entries)`);
      score += 15;
    }
    
    const isComplex = score >= this.COMPLEXITY_THRESHOLD;
    
    return { isComplex, reasons, score };
  }
  
  /**
   * Remove duplicate headers/footers from multi-page PDFs
   */
  private deduplicateHeadersFooters(text: string): string {
    const lines = text.split('\n');
    const lineFrequency = new Map<string, number>();
    
    // Count line occurrences
    lines.forEach(line => {
      const normalized = line.trim().toLowerCase();
      if (normalized.length > 10) { // Ignore very short lines
        lineFrequency.set(normalized, (lineFrequency.get(normalized) || 0) + 1);
      }
    });
    
    // Find repeated lines (appear 3+ times = likely header/footer)
    const repeatedLines = new Set<string>();
    lineFrequency.forEach((count, line) => {
      if (count >= 3) {
        repeatedLines.add(line);
      }
    });
    
    if (repeatedLines.size === 0) {
      return text; // No duplicates found
    }
    
    // Remove duplicates, keep first occurrence
    const seen = new Set<string>();
    const deduplicated = lines.filter(line => {
      const normalized = line.trim().toLowerCase();
      
      if (repeatedLines.has(normalized)) {
        if (seen.has(normalized)) {
          return false; // Skip duplicate
        }
        seen.add(normalized);
      }
      
      return true;
    });
    
    const originalLength = text.length;
    const newText = deduplicated.join('\n');
    const saved = originalLength - newText.length;
    
    if (saved > 0) {
      console.log(`✓ Deduplication removed ${saved} characters (~${Math.ceil(saved/4)} tokens)`);
    }
    
    return newText;
  }
  
  /**
   * Parse long resumes using chunking strategy
   */
  async parseResumeWithChunking(rawText: string): Promise<AIResumeOutput> {
    if (!this.isAvailable()) {
      throw new Error('Watsonx AI service not available - check API credentials');
    }
    
    console.log('📄 Starting chunked parsing...');
    
    // Step 1: Extract personal info and summary from first 2 pages
    const firstSection = this.extractFirstPages(rawText, 2);
    const personalChunk = await this.parsePersonalInfoChunk(firstSection);
    
    // Step 2: Extract and chunk work experience section
    const workExpSection = this.extractSection(rawText, 'experience');
    const workExpChunks = this.chunkWorkExperience(workExpSection, 3); // 3 jobs per chunk
    const workExperiences = [];
    
    for (let i = 0; i < workExpChunks.length; i++) {
      console.log(`  Processing work experience chunk ${i + 1}/${workExpChunks.length}...`);
      const parsed = await this.parseWorkExperienceChunk(workExpChunks[i]);
      workExperiences.push(...parsed);
    }
    
    // Step 3: Extract education and skills (usually short)
    const educationSection = this.extractSection(rawText, 'education');
    const skillsSection = this.extractSection(rawText, 'skills');
    const education = await this.parseEducationChunk(educationSection);
    const skills = await this.parseSkillsChunk(skillsSection);
    
    console.log('✅ Chunked parsing complete');
    
    // Step 4: Merge results
    return {
      personal_info: personalChunk.personal_info || {},
      summary: personalChunk.summary || '',
      skills: skills,
      work_experience: workExperiences,
      education: education,
      certifications: personalChunk.certifications || [],
      projects: personalChunk.projects || []
    };
  }
  
  /**
   * Extract first N pages (approximate)
   */
  private extractFirstPages(text: string, pages: number): string {
    // Estimate: ~500 words per page
    const words = text.split(/\s+/);
    const targetWords = pages * 500;
    return words.slice(0, targetWords).join(' ');
  }
  
  /**
   * Extract a specific section from resume text
   */
  private extractSection(text: string, sectionName: string): string {
    const patterns: { [key: string]: RegExp } = {
      experience: /(?:work\s+)?(?:experience|employment|work\s+history)([\s\S]*?)(?=\n(?:education|skills|projects|certifications)|$)/i,
      education: /education([\s\S]*?)(?=\n(?:experience|skills|projects|certifications)|$)/i,
      skills: /(?:skills|technical\s+skills|core\s+competencies)([\s\S]*?)(?=\n(?:experience|education|projects|certifications)|$)/i
    };
    
    const pattern = patterns[sectionName];
    if (!pattern) {
      return '';
    }
    
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }
  
  /**
   * Chunk work experience into smaller pieces
   */
  private chunkWorkExperience(text: string, jobsPerChunk: number): string[] {
    if (!text) return [];
    
    // Split by common job separators (company names, dates)
    const jobs = text.split(/\n(?=\w+[\s,]+(?:Inc|LLC|Ltd|Corporation|Company)|\d{4}\s*[-–]\s*(?:\d{4}|Present))/);
    const chunks: string[] = [];
    
    for (let i = 0; i < jobs.length; i += jobsPerChunk) {
      const chunk = jobs.slice(i, i + jobsPerChunk).join('\n');
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }
    
    return chunks.length > 0 ? chunks : [text]; // Fallback to full text if splitting failed
  }
  
  /**
   * Parse personal info chunk
   */
  private async parsePersonalInfoChunk(text: string): Promise<any> {
    const prompt = `${ResumeParserService.CACHED_SYSTEM_PROMPT}

Extract ONLY personal information, summary, certifications, and projects from this resume section.

OUTPUT SCHEMA:
{
  "personal_info": { "name": "string", "email": "string", "phone": "string", "linkedin": "string", "location": "string", "github": "string", "portfolio": "string" },
  "summary": "string",
  "certifications": ["string"],
  "projects": [{ "name": "string", "description": "string", "technologies": ["string"] }]
}

RESUME TEXT:
${text}

JSON OUTPUT:`;

    const response = await this.watsonxClient!.generateText({
      modelId: this.config.model,
      projectId: this.config.projectId,
      input: prompt,
      parameters: {
        max_new_tokens: 1500,
        temperature: 0.3,
        top_p: 0.85,
        repetition_penalty: 1.2
      }
    });
    
    const generatedText = this.extractGeneratedText(response);
    return this.extractJSON(generatedText);
  }
  
  /**
   * Parse work experience chunk
   */
  private async parseWorkExperienceChunk(text: string): Promise<any[]> {
    const prompt = `${ResumeParserService.CACHED_SYSTEM_PROMPT}

Extract ONLY work experience entries from this text.

OUTPUT SCHEMA:
{
  "work_experience": [{
    "company": "string",
    "title": "string",
    "duration": "string",
    "description": "string",
    "years_of_experience": number,
    "location": "string"
  }]
}

RESUME TEXT:
${text}

JSON OUTPUT:`;

    const response = await this.watsonxClient!.generateText({
      modelId: this.config.model,
      projectId: this.config.projectId,
      input: prompt,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.3,
        top_p: 0.85,
        repetition_penalty: 1.2
      }
    });
    
    const generatedText = this.extractGeneratedText(response);
    const parsed = this.extractJSON(generatedText);
    return parsed.work_experience || [];
  }
  
  /**
   * Parse education chunk
   */
  private async parseEducationChunk(text: string): Promise<any[]> {
    if (!text) return [];
    
    const prompt = `${ResumeParserService.CACHED_SYSTEM_PROMPT}

Extract ONLY education entries from this text.

OUTPUT SCHEMA:
{
  "education": [{
    "institution": "string",
    "degree": "string",
    "year": "string",
    "field": "string"
  }]
}

RESUME TEXT:
${text}

JSON OUTPUT:`;

    const response = await this.watsonxClient!.generateText({
      modelId: this.config.model,
      projectId: this.config.projectId,
      input: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.3,
        top_p: 0.85,
        repetition_penalty: 1.2
      }
    });
    
    const generatedText = this.extractGeneratedText(response);
    const parsed = this.extractJSON(generatedText);
    return parsed.education || [];
  }
  
  /**
   * Parse skills chunk
   */
  private async parseSkillsChunk(text: string): Promise<string[]> {
    if (!text) return [];
    
    const prompt = `${ResumeParserService.CACHED_SYSTEM_PROMPT}

Extract ONLY skills from this text.

OUTPUT SCHEMA:
{
  "skills": ["string"]
}

RESUME TEXT:
${text}

JSON OUTPUT:`;

    const response = await this.watsonxClient!.generateText({
      modelId: this.config.model,
      projectId: this.config.projectId,
      input: prompt,
      parameters: {
        max_new_tokens: 800,
        temperature: 0.3,
        top_p: 0.85,
        repetition_penalty: 1.2
      }
    });
    
    const generatedText = this.extractGeneratedText(response);
    const parsed = this.extractJSON(generatedText);
    return parsed.skills || [];
  }
  
  /**
   * Extract generated text from Watsonx response
   */
  private extractGeneratedText(response: any): string {
    let generatedText: string | undefined;
    
    if ((response.result as any)?.generated_text) {
      generatedText = (response.result as any).generated_text;
    } else if ((response.result as any)?.results?.[0]?.generated_text) {
      generatedText = (response.result as any).results[0].generated_text;
    } else if ((response as any)?.generated_text) {
      generatedText = (response as any).generated_text;
    } else if ((response as any)?.results?.[0]?.generated_text) {
      generatedText = (response as any).results[0].generated_text;
    } else {
      throw new Error('Generated text not found in watsonx response');
    }
    
    if (!generatedText) {
      throw new Error('Generated text is empty or undefined');
    }
    
    return generatedText;
  }
  
  /**
   * Parse resume using Watsonx Granite AI (original method, now with optimized prompt)
   */
  async parseResume(rawText: string): Promise<AIResumeOutput> {
    if (!this.isAvailable()) {
      throw new Error('Watsonx AI service not available - check API credentials');
    }
    
    const prompt = this.buildPrompt(rawText);
    
    try {
      console.log('🤖 Calling Watsonx Granite for resume parsing...');
      
      const response = await this.watsonxClient!.generateText({
        modelId: this.config.model,
        projectId: this.config.projectId,
        input: prompt,
        parameters: {
          max_new_tokens: 5000,  // Increased from 1500 to handle longer resumes
          temperature: 0.3,
          top_p: 0.85,
          repetition_penalty: 1.2
        }
      });
      
      console.log('✅ Watsonx response received');
      console.log('Response structure:', JSON.stringify(response, null, 2).substring(0, 500));
      
      // Try different possible response structures
      let generatedText: string | undefined;
      
      if ((response.result as any)?.generated_text) {
        generatedText = (response.result as any).generated_text;
        console.log('✓ Found text at: response.result.generated_text');
      } else if ((response.result as any)?.results?.[0]?.generated_text) {
        generatedText = (response.result as any).results[0].generated_text;
        console.log('✓ Found text at: response.result.results[0].generated_text');
      } else if ((response as any)?.generated_text) {
        generatedText = (response as any).generated_text;
        console.log('✓ Found text at: response.generated_text');
      } else if ((response as any)?.results?.[0]?.generated_text) {
        generatedText = (response as any).results[0].generated_text;
        console.log('✓ Found text at: response.results[0].generated_text');
      } else {
        console.error('❌ Could not find generated text in response');
        console.error('Response keys:', Object.keys(response));
        console.error('Result keys:', response.result ? Object.keys(response.result) : 'No result');
        throw new Error('Generated text not found in watsonx response');
      }
      
      if (!generatedText) {
        throw new Error('Generated text is empty or undefined');
      }
      
      console.log('Generated text length:', generatedText.length);
      console.log('Generated text preview:', generatedText.substring(0, 200));
      
      return this.extractJSON(generatedText);
    } catch (error) {
      console.error('❌ Watsonx API error:', error);
      throw error;
    }
  }
  
  /**
   * Build optimized prompt for resume parsing using cached components
   */
  private buildPrompt(rawText: string): string {
    return `${ResumeParserService.CACHED_SYSTEM_PROMPT}

${ResumeParserService.CACHED_SCHEMA}

${ResumeParserService.CACHED_EXAMPLES}

RESUME TEXT:
${rawText}

JSON OUTPUT:`;
  }
  
  /**
   * Extract and parse JSON from AI response
   */
  private extractJSON(text: string | undefined): AIResumeOutput {
    // Validate input
    if (!text || typeof text !== 'string') {
      console.error('❌ Invalid input to extractJSON:', typeof text);
      throw new Error(`Invalid AI response: expected string, got ${typeof text}`);
    }
    
    try {
      console.log('Attempting to extract JSON from response...');
      console.log('Response text length:', text.length);
      console.log('Response text preview:', text.substring(0, 300));
      
      // Remove markdown code fences if present
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, '');  // Remove opening ```json
      cleanedText = cleanedText.replace(/^```\s*/i, '');      // Remove opening ```
      cleanedText = cleanedText.replace(/\s*```\s*$/i, '');   // Remove closing ```
      cleanedText = cleanedText.trim();
      
      console.log('Cleaned text preview:', cleanedText.substring(0, 300));
      
      // Try to find JSON in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in AI response');
        console.error('Full cleaned text:', cleanedText);
        throw new Error('No JSON found in AI response');
      }
      
      console.log('✓ JSON pattern found, attempting to parse...');
      
      let jsonString = jsonMatch[0];
      
      // Try to fix common JSON issues
      // 1. Remove trailing commas before closing braces/brackets
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      // 2. Fix trailing commas at end of arrays/objects more aggressively
      jsonString = jsonString.replace(/,(\s*\n\s*[}\]])/g, '$1');
      
      // 3. If JSON ends with a comma, try to close it properly
      if (jsonString.trim().endsWith(',')) {
        jsonString = jsonString.trim().slice(0, -1) + '}';
      }
      
      // 4. Ensure JSON is properly closed
      const openBraces = (jsonString.match(/\{/g) || []).length;
      const closeBraces = (jsonString.match(/\}/g) || []).length;
      const openBrackets = (jsonString.match(/\[/g) || []).length;
      const closeBrackets = (jsonString.match(/\]/g) || []).length;
      
      if (openBrackets > closeBrackets) {
        console.log(`⚠️  Adding ${openBrackets - closeBrackets} missing closing brackets`);
        jsonString += ']'.repeat(openBrackets - closeBrackets);
      }
      
      if (openBraces > closeBraces) {
        console.log(`⚠️  Adding ${openBraces - closeBraces} missing closing braces`);
        jsonString += '}'.repeat(openBraces - closeBraces);
      }
      
      console.log('Cleaned JSON preview (last 200 chars):', jsonString.slice(-200));
      
      // 2. Try to parse
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
        console.log('✓ JSON parsed successfully');
      } catch (parseError) {
        console.warn('⚠️  Initial parse failed, attempting to fix JSON...');
        console.warn('Parse error:', parseError instanceof Error ? parseError.message : String(parseError));
        
        // Strategy 1: Try to truncate at the last complete work_experience entry
        const workExpPattern = /"work_experience"\s*:\s*\[([\s\S]*?)\]/;
        const workExpMatch = jsonString.match(workExpPattern);
        
        if (workExpMatch) {
          console.log('Attempting to fix work_experience array...');
          
          // Find the last complete work experience object
          const workExpArray = workExpMatch[1];
          const lastCompleteEntry = workExpArray.lastIndexOf('}');
          
          if (lastCompleteEntry > 0) {
            // Truncate to last complete entry
            const fixedWorkExp = workExpArray.substring(0, lastCompleteEntry + 1);
            const fixedJson = jsonString.replace(
              workExpPattern,
              `"work_experience": [${fixedWorkExp}]`
            );
            
            try {
              // Try to close any remaining open structures
              let testJson = fixedJson;
              const openBraces = (testJson.match(/\{/g) || []).length;
              const closeBraces = (testJson.match(/\}/g) || []).length;
              
              if (openBraces > closeBraces) {
                testJson += '}'.repeat(openBraces - closeBraces);
              }
              
              parsed = JSON.parse(testJson);
              console.log('✓ JSON parsed after fixing work_experience array');
              return {
                personal_info: parsed.personal_info || {},
                summary: parsed.summary || '',
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
                education: Array.isArray(parsed.education) ? parsed.education : [],
                certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
                projects: Array.isArray(parsed.projects) ? parsed.projects : []
              };
            } catch (e) {
              console.warn('⚠️  work_experience fix failed, trying other strategies...');
            }
          }
        }
        
        // Strategy 2: Try to find the last complete top-level field
        const topLevelFields = ['projects', 'certifications', 'education', 'work_experience', 'skills', 'summary', 'personal_info'];
        
        for (const field of topLevelFields) {
          try {
            // Find the end of this field
            const fieldPattern = new RegExp(`"${field}"\\s*:\\s*([^,}]+|\\{[^}]*\\}|\\[[^\\]]*\\])`, 'g');
            const matches = [...jsonString.matchAll(fieldPattern)];
            
            if (matches.length > 0) {
              const lastMatch = matches[matches.length - 1];
              const endPos = lastMatch.index! + lastMatch[0].length;
              
              // Try to create valid JSON up to this point
              let testString = jsonString.substring(0, endPos);
              
              // Add closing structures
              const openBraces = (testString.match(/\{/g) || []).length;
              const closeBraces = (testString.match(/\}/g) || []).length;
              const openBrackets = (testString.match(/\[/g) || []).length;
              const closeBrackets = (testString.match(/\]/g) || []).length;
              
              testString += ']'.repeat(openBrackets - closeBrackets);
              testString += '}'.repeat(openBraces - closeBraces);
              
              parsed = JSON.parse(testString);
              console.log(`✓ JSON parsed after truncating at "${field}" field`);
              return {
                personal_info: parsed.personal_info || {},
                summary: parsed.summary || '',
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
                education: Array.isArray(parsed.education) ? parsed.education : [],
                certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
                projects: Array.isArray(parsed.projects) ? parsed.projects : []
              };
            }
          } catch (e) {
            // Continue trying other fields
          }
        }
        
        // Strategy 3: Simple character-by-character truncation (last resort)
        console.warn('⚠️  All smart truncation strategies failed, using simple truncation...');
        for (let i = jsonString.length - 1; i > jsonString.length / 2; i--) {
          try {
            const testString = jsonString.substring(0, i) + '}';
            parsed = JSON.parse(testString);
            console.log(`✓ JSON parsed after simple truncation at position ${i}`);
            return {
              personal_info: parsed.personal_info || {},
              summary: parsed.summary || '',
              skills: Array.isArray(parsed.skills) ? parsed.skills : [],
              work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
              education: Array.isArray(parsed.education) ? parsed.education : [],
              certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
              projects: Array.isArray(parsed.projects) ? parsed.projects : []
            };
          } catch (e) {
            // Continue searching
          }
        }
        
        // If we get here, nothing worked
        throw parseError;
      }
      
      // Ensure required fields exist with defaults
      return {
        personal_info: parsed.personal_info || {},
        summary: parsed.summary || '',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : []
      };
    } catch (error) {
      console.error('❌ Failed to parse AI response as JSON:', error);
      if (text) {
        console.error('Response text (first 500 chars):', text.substring(0, 500));
        console.error('Response text (last 500 chars):', text.substring(Math.max(0, text.length - 500)));
      }
      throw new Error('Invalid JSON in AI response');
    }
  }
  
  /**
   * Convert AI output format to standard ParsedResumeData format
   */
  convertToStandardFormat(aiOutput: AIResumeOutput, rawText: string): ParsedResumeData {
    return {
      rawText,
      parsedSections: {
        personalInfo: {
          name: aiOutput.personal_info.name,
          email: aiOutput.personal_info.email,
          phone: aiOutput.personal_info.phone,
          location: aiOutput.personal_info.location,
          linkedin: aiOutput.personal_info.linkedin,
          github: aiOutput.personal_info.github,
          portfolio: aiOutput.personal_info.portfolio
        },
        summary: aiOutput.summary,
        skills: aiOutput.skills,
        workExperience: aiOutput.work_experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          location: exp.location,
          duration: exp.duration,
          yearsOfExperience: exp.years_of_experience,
          description: exp.description,
          achievements: [],
          skills: []
        })),
        projects: aiOutput.projects.map(proj => ({
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
          achievements: [],
          skills: proj.technologies
        })),
        education: aiOutput.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          field: edu.field,
          honors: []
        })),
        certifications: aiOutput.certifications
      },
      // Legacy compatibility
      skills: aiOutput.skills,
      workExperience: aiOutput.work_experience,
      projects: aiOutput.projects,
      education: aiOutput.education,
      certifications: aiOutput.certifications
    };
  }
}
