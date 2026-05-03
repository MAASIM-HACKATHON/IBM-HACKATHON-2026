/**
 * CV Generator Service - MVP Implementation
 * 
 * Features:
 * - Single AI pass (expansion + personalization)
 * - Backend fallback for missing ATS insights
 * - Built-in caching
 * - Token-efficient prompts (80-120 words per section)
 */

import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import type { CandidateResume } from '@/types/ats.types';
import crypto from 'crypto';

interface ATSInsights {
  keywords: string[];
  gaps: string[];
  strengths: string[];
  score: number;
  prioritizedSkills: string[];
}

interface CVGenerationRequest {
  profileData: CandidateResume;
  jobDescription: string;
  atsInsights?: ATSInsights; // Optional - will compute if missing
  targetRole?: string;
}

// Simple in-memory cache
const cvCache = new Map<string, { cv: string; timestamp: number }>();
const atsInsightsCache = new Map<string, { insights: ATSInsights; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class CVGeneratorService {
  private watsonxClient: WatsonXAI | null = null;
  
  constructor() {
    const apiKey = process.env.WATSONX_API_KEY || '';
    const projectId = process.env.WATSONX_PROJECT_ID || '';
    
    if (apiKey && projectId) {
      try {
        this.watsonxClient = new WatsonXAI({
          version: '2023-05-29',
          serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
          authenticator: new IamAuthenticator({ apikey: apiKey })
        });
        console.log('✅ CV Generator: Watsonx AI initialized');
      } catch (error) {
        console.error('❌ CV Generator: Failed to initialize Watsonx:', error);
      }
    } else {
      console.warn('⚠️  CV Generator: Watsonx credentials not configured');
    }
  }
  
  /**
   * Main entry point - generates full CV with AI enhancement
   */
  async generateFullCV(request: CVGenerationRequest): Promise<string> {
    console.log('🚀 CV Generator: Starting CV generation...');
    
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = cvCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✓ CV Generator: Returning cached CV');
      return cached.cv;
    }
    
    // Get or compute ATS insights
    let insights = request.atsInsights;
    if (!insights) {
      console.log('⚠️  CV Generator: No ATS insights provided, computing fallback...');
      insights = this.computeATSInsights(request.profileData, request.jobDescription);
    } else {
      console.log('✓ CV Generator: Using provided ATS insights');
    }
    
    // Step 1: Structure CV with rules
    console.log('📋 CV Generator: Structuring CV with rules...');
    const structured = this.structureCV(request.profileData, insights);
    
    // Step 2: Enhance with AI (single pass)
    let finalCV: string;
    if (this.watsonxClient) {
      try {
        console.log('🤖 CV Generator: Enhancing with AI (single pass)...');
        finalCV = await this.enhanceWithAI(structured, insights, request);
        console.log('✅ CV Generator: AI enhancement complete');
      } catch (error) {
        console.error('❌ CV Generator: AI enhancement failed, using structured version:', error);
        finalCV = structured;
      }
    } else {
      console.warn('⚠️  CV Generator: Watsonx not available, using structured version');
      finalCV = structured;
    }
    
    // Cache result
    cvCache.set(cacheKey, { cv: finalCV, timestamp: Date.now() });
    console.log('✓ CV Generator: CV cached');
    
    return finalCV;
  }
  
  /**
   * Compute ATS insights if not provided (fallback)
   */
  private computeATSInsights(
    profileData: CandidateResume,
    jobDescription: string
  ): ATSInsights {
    // Check cache
    const cacheKey = crypto.createHash('md5')
      .update(JSON.stringify({ profile: profileData, job: jobDescription }))
      .digest('hex');
    
    const cached = atsInsightsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✓ Using cached ATS insights');
      return cached.insights;
    }
    
    // Extract keywords from job description
    const keywords = this.extractKeywords(jobDescription);
    
    // Analyze profile
    const resumeText = JSON.stringify(profileData).toLowerCase();
    const matchedKeywords = keywords.filter(k => resumeText.includes(k.toLowerCase()));
    const keywordMatchRate = (matchedKeywords.length / Math.max(keywords.length, 1)) * 100;
    
    // Identify gaps
    const gaps: string[] = [];
    if (!profileData.skills || profileData.skills.length < 5) {
      gaps.push('Limited technical skills listed');
    }
    if (!profileData.workExperience || profileData.workExperience.length === 0) {
      gaps.push('Missing detailed work experience');
    }
    const hasQuantifiable = profileData.workExperience?.some(exp => 
      exp.description?.match(/\d+%|\$\d+|increased|decreased|improved/i)
    );
    if (!hasQuantifiable) {
      gaps.push('Lacks quantifiable achievements');
    }
    
    // Identify strengths
    const strengths: string[] = [];
    if (keywordMatchRate > 60) {
      strengths.push('Strong keyword alignment with job requirements');
    }
    if (profileData.skills && profileData.skills.length >= 8) {
      strengths.push('Comprehensive technical skill set');
    }
    if (hasQuantifiable) {
      strengths.push('Includes quantifiable achievements');
    }
    const totalYears = this.calculateTotalExperience(profileData);
    if (totalYears >= 5) {
      strengths.push(`${totalYears}+ years of relevant experience`);
    }
    
    // Calculate score
    let score = 0;
    score += Math.min(keywordMatchRate, 40); // Max 40 points for keywords
    score += profileData.skills && profileData.skills.length >= 8 ? 20 : 10;
    score += hasQuantifiable ? 20 : 0;
    score += totalYears >= 3 ? 20 : 10;
    
    // Prioritize skills
    const prioritizedSkills = this.prioritizeSkills(profileData.skills || [], keywords);
    
    const insights: ATSInsights = {
      keywords,
      gaps,
      strengths,
      score: Math.round(score),
      prioritizedSkills
    };
    
    // Cache insights
    atsInsightsCache.set(cacheKey, { insights, timestamp: Date.now() });
    
    return insights;
  }
  
  /**
   * Structure CV with rule-based formatting
   */
  private structureCV(profileData: CandidateResume, insights: ATSInsights): string {
    let cv = '';
    
    // Header
    cv += '═'.repeat(70) + '\n';
    cv += 'COMPREHENSIVE CURRICULUM VITAE\n';
    cv += '═'.repeat(70) + '\n\n';
    
    // Professional Summary
    cv += 'PROFESSIONAL SUMMARY\n';
    cv += '─'.repeat(70) + '\n';
    cv += this.generateSummary(profileData, insights);
    cv += '\n\n';
    
    // Core Skills (prioritized)
    if (insights.prioritizedSkills.length > 0) {
      cv += 'CORE COMPETENCIES & TECHNICAL SKILLS\n';
      cv += '─'.repeat(70) + '\n';
      const skillsPerRow = 4;
      for (let i = 0; i < insights.prioritizedSkills.length; i += skillsPerRow) {
        const skillGroup = insights.prioritizedSkills.slice(i, i + skillsPerRow);
        cv += skillGroup.join(' • ') + '\n';
      }
      cv += '\n';
    }
    
    // Work Experience
    if (profileData.workExperience && profileData.workExperience.length > 0) {
      cv += 'PROFESSIONAL EXPERIENCE\n';
      cv += '─'.repeat(70) + '\n\n';
      
      profileData.workExperience.forEach((exp, index) => {
        cv += `${exp.title}\n`;
        cv += `${exp.company}`;
        if (exp.duration) cv += ` | ${exp.duration}`;
        if (exp.location) cv += ` | ${exp.location}`;
        cv += '\n';
        cv += '·'.repeat(70) + '\n';
        
        if (exp.description) {
          cv += `${exp.description}\n\n`;
        }
        
        if (exp.skills && exp.skills.length > 0) {
          cv += 'Key Technologies & Skills:\n';
          exp.skills.forEach(skill => {
            cv += `  • ${skill}\n`;
          });
          cv += '\n';
        }
        
        if (index < profileData.workExperience!.length - 1) {
          cv += '\n';
        }
      });
      cv += '\n';
    }
    
    // Projects
    if (profileData.projects && profileData.projects.length > 0) {
      cv += 'KEY PROJECTS & PORTFOLIO\n';
      cv += '─'.repeat(70) + '\n\n';
      
      profileData.projects.forEach((project, index) => {
        cv += `${project.name}\n`;
        cv += '·'.repeat(70) + '\n';
        cv += `${project.description}\n`;
        
        if (project.role) {
          cv += `Role: ${project.role}\n`;
        }
        
        if (project.technologies && project.technologies.length > 0) {
          cv += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        
        if (project.achievements && project.achievements.length > 0) {
          cv += '\nKey Achievements:\n';
          project.achievements.forEach(achievement => {
            cv += `  • ${achievement}\n`;
          });
        }
        
        if (index < profileData.projects!.length - 1) {
          cv += '\n';
        }
      });
      cv += '\n';
    }
    
    // Education
    if (profileData.education && profileData.education.length > 0) {
      cv += 'EDUCATION\n';
      cv += '─'.repeat(70) + '\n';
      
      profileData.education.forEach(edu => {
        cv += `${edu.degree}`;
        if (edu.field) cv += ` in ${edu.field}`;
        cv += '\n';
        cv += `${edu.institution}`;
        if (edu.location) cv += `, ${edu.location}`;
        if (edu.year) cv += ` | ${edu.year}`;
        cv += '\n';
        
        if (edu.gpa) {
          cv += `GPA: ${edu.gpa}\n`;
        }
        
        if (edu.honors && edu.honors.length > 0) {
          cv += `Honors: ${edu.honors.join(', ')}\n`;
        }
        
        cv += '\n';
      });
    }
    
    // Certifications
    if (profileData.certifications && profileData.certifications.length > 0) {
      cv += 'CERTIFICATIONS & PROFESSIONAL DEVELOPMENT\n';
      cv += '─'.repeat(70) + '\n';
      profileData.certifications.forEach(cert => {
        cv += `  • ${cert}\n`;
      });
      cv += '\n';
    }
    
    // Footer
    cv += '═'.repeat(70) + '\n';
    cv += `Generated by IBM Watsonx AI Resume Builder | ${new Date().toLocaleDateString()}\n`;
    cv += '═'.repeat(70) + '\n';
    
    return cv;
  }
  
  /**
   * Enhance CV with AI - SINGLE PASS (expansion + personalization)
   * Token-efficient: 80-120 words per experience, 60-100 per project
   */
  private async enhanceWithAI(
    structuredCV: string,
    insights: ATSInsights,
    request: CVGenerationRequest
  ): Promise<string> {
    const prompt = `You are an expert CV writer. Enhance this CV by expanding descriptions and personalizing for the target role.

TARGET ROLE: ${request.targetRole || 'Professional position'}

JOB REQUIREMENTS (excerpt):
${request.jobDescription.substring(0, 400)}

ATS ANALYSIS:
- Strengths: ${insights.strengths.join(', ')}
- Gaps to address: ${insights.gaps.join(', ')}
- Priority skills: ${insights.prioritizedSkills.slice(0, 5).join(', ')}

CURRENT CV:
${structuredCV}

INSTRUCTIONS:
1. Expand work experience descriptions to 80-120 words each (concise but detailed)
2. Add technical depth to project descriptions (60-100 words)
3. Emphasize the identified strengths
4. Subtly address gaps where relevant
5. Use professional tone appropriate for seniority
6. Keep all factual information accurate - DO NOT invent details
7. Use action verbs and quantify achievements where possible
8. Maintain the same formatting structure

OUTPUT: Enhanced CV in plain text with same format

ENHANCED CV:`;

    try {
      const response = await this.watsonxClient!.generateText({
        modelId: process.env.WATSONX_MODEL_ID || 'meta-llama/llama-3-8b-instruct',
        projectId: process.env.WATSONX_PROJECT_ID!,
        input: prompt,
        parameters: {
          max_new_tokens: 3000,
          temperature: 0.4,
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      });
      
      const generatedText = this.extractGeneratedText(response);
      
      if (!generatedText || generatedText.trim().length < 100) {
        console.warn('⚠️  AI generated text too short, using structured version');
        return structuredCV;
      }
      
      return generatedText;
    } catch (error) {
      console.error('❌ AI enhancement error:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private getCacheKey(request: CVGenerationRequest): string {
    const data = JSON.stringify({
      profile: request.profileData,
      job: request.jobDescription,
      role: request.targetRole
    });
    return crypto.createHash('md5').update(data).digest('hex');
  }
  
  private extractKeywords(jobDescription: string): string[] {
    const keywords: string[] = [];
    const patterns = [
      /\b(react|vue|angular|javascript|typescript|node\.?js|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin)\b/gi,
      /\b(html|css|sass|less|tailwind|bootstrap|material-ui)\b/gi,
      /\b(express|django|flask|spring|laravel|rails|fastapi)\b/gi,
      /\b(mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|oracle)\b/gi,
      /\b(docker|kubernetes|aws|azure|gcp|terraform|ansible)\b/gi,
      /\b(git|github|gitlab|ci\/cd|jenkins|travis|circleci)\b/gi,
      /\b(agile|scrum|kanban|jira|confluence)\b/gi,
      /\b(rest|graphql|api|microservices|serverless)\b/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = jobDescription.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const normalized = match.trim().toLowerCase();
          if (!keywords.includes(normalized)) {
            keywords.push(normalized);
          }
        });
      }
    });
    
    return keywords;
  }
  
  private prioritizeSkills(skills: string[], keywords: string[]): string[] {
    const prioritized: string[] = [];
    const remaining: string[] = [];
    
    skills.forEach(skill => {
      const isRelevant = keywords.some(keyword => 
        skill.toLowerCase().includes(keyword) || keyword.includes(skill.toLowerCase())
      );
      
      if (isRelevant) {
        prioritized.push(skill);
      } else {
        remaining.push(skill);
      }
    });
    
    return [...prioritized, ...remaining];
  }
  
  private generateSummary(profileData: CandidateResume, insights: ATSInsights): string {
    const years = this.calculateTotalExperience(profileData);
    const topSkills = insights.prioritizedSkills.slice(0, 5);
    
    let summary = `Accomplished professional with ${years}+ years of comprehensive experience in ${topSkills.slice(0, 3).join(', ')}`;
    
    if (insights.strengths.length > 0) {
      summary += `. ${insights.strengths[0]}`;
    }
    
    summary += `. Proven track record of delivering high-impact solutions and driving organizational success through technical excellence and collaborative leadership.`;
    
    return summary;
  }
  
  private calculateTotalExperience(profileData: CandidateResume): number {
    if (!profileData.workExperience || profileData.workExperience.length === 0) {
      return 0;
    }
    
    const totalYears = profileData.workExperience.reduce((sum, exp) => {
      return sum + (exp.yearsOfExperience || 0);
    }, 0);
    
    return Math.max(totalYears, 1);
  }
  
  private extractGeneratedText(response: any): string | null {
    try {
      if ((response.result as any)?.generated_text) {
        return (response.result as any).generated_text;
      } else if ((response.result as any)?.results?.[0]?.generated_text) {
        return (response.result as any).results[0].generated_text;
      } else if ((response as any)?.generated_text) {
        return (response as any).generated_text;
      } else if ((response as any)?.results?.[0]?.generated_text) {
        return (response as any).results[0].generated_text;
      }
    } catch (error) {
      console.error('Error extracting generated text:', error);
    }
    return null;
  }
  
  /**
   * Clear caches (useful for testing)
   */
  static clearCaches(): void {
    cvCache.clear();
    atsInsightsCache.clear();
    console.log('✓ CV Generator caches cleared');
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats(): { cvCacheSize: number; insightsCacheSize: number } {
    return {
      cvCacheSize: cvCache.size,
      insightsCacheSize: atsInsightsCache.size
    };
  }
}
