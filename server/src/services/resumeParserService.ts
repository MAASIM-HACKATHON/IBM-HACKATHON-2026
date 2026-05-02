/**
 * AI-Powered Resume Parser using Watsonx Granite
 * Transforms unstructured resume text into structured JSON
 */

import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import { AIResumeOutput, ParsedResumeData } from '@/types/resume-parser.types';

interface ResumeParserConfig {
  apiKey: string;
  projectId: string;
  serviceUrl: string;
  model: string;
}

export class ResumeParserService {
  private watsonxClient: WatsonXAI | null = null;
  private config: ResumeParserConfig;
  
  constructor() {
    this.config = {
      apiKey: process.env.WATSONX_API_KEY || '',
      projectId: process.env.WATSONX_PROJECT_ID || '',
      serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
      model: 'ibm/granite-3-8b-instruct'
    };
    
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
      } catch (error) {
        console.error('❌ Failed to initialize Watsonx client:', error);
      }
    } else {
      console.warn('⚠️  Watsonx credentials not configured, AI parsing will be unavailable');
    }
  }
  
  /**
   * Check if AI parsing is available
   */
  isAvailable(): boolean {
    return this.watsonxClient !== null && !!this.config.apiKey && !!this.config.projectId;
  }
  
  /**
   * Parse resume using Watsonx Granite AI
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
   * Build optimized prompt for resume parsing
   */
  private buildPrompt(rawText: string): string {
    return `You are a resume parsing expert. Extract structured data from the following resume text.

CRITICAL RULES:
1. Reconstruct broken entities (URLs, names split across lines)
2. Identify sections by context, not just headers
3. Consolidate multi-line fields into single entries
4. Extract ALL information present
5. Return ONLY valid JSON, no explanations

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
}

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
}

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
