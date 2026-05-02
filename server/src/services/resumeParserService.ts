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
          max_new_tokens: 1500,
          temperature: 0.3,
          top_p: 0.85,
          repetition_penalty: 1.2
        }
      });
      
      const generatedText = (response.result as any).generated_text;
      console.log('✅ Watsonx response received');
      
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
  private extractJSON(text: string): AIResumeOutput {
    try {
      // Try to find JSON in the response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
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
      console.error('Response text:', text.substring(0, 500));
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
