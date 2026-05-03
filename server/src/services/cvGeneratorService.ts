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
    console.log('📋 Request details:', {
      hasProfileData: !!request.profileData,
      hasJobDescription: !!request.jobDescription,
      hasAtsInsights: !!request.atsInsights,
      targetRole: request.targetRole || 'not provided'
    });
    
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = cvCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✓ CV Generator: Returning cached CV');
      console.log('   Cached CV length:', cached.cv.length);
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
    
    // Step 1: Prepare RAW resume data (NOT formatted CV)
    console.log('📋 CV Generator: Preparing raw resume data for AI...');
    const rawResumeData = this.prepareRawResumeData(request.profileData, insights);
    console.log('   Raw data length:', rawResumeData.length);
    console.log('   Raw data preview (first 300 chars):', rawResumeData.substring(0, 300));
    
    // Step 2: Transform with AI (AI does the structuring and formatting)
    let finalCV: string;
    if (this.watsonxClient) {
      try {
        console.log('🤖 CV Generator: Transforming with AI...');
        finalCV = await this.transformWithAI(rawResumeData, insights, request);
        console.log('✅ CV Generator: AI transformation complete');
        console.log('   Final CV length:', finalCV.length);
        console.log('   Final CV preview (first 500 chars):', finalCV.substring(0, 500));
        console.log('   Final CV preview (last 500 chars):', finalCV.substring(Math.max(0, finalCV.length - 500)));
      } catch (error) {
        console.error('❌ CV Generator: AI transformation failed, using structured fallback:', error);
        // Fallback to structured CV if AI fails
        finalCV = this.structureCV(request.profileData, insights);
        console.log('   Fallback CV length:', finalCV.length);
      }
    } else {
      console.warn('⚠️  CV Generator: Watsonx not available, using structured version');
      finalCV = this.structureCV(request.profileData, insights);
      console.log('   Structured CV length:', finalCV.length);
    }
    
    // Cache result
    cvCache.set(cacheKey, { cv: finalCV, timestamp: Date.now() });
    console.log('✓ CV Generator: CV cached');
    
    console.log('🎉 CV Generator: Returning final CV');
    console.log('   Total length:', finalCV.length);
    console.log('   First line:', finalCV.split('\n')[0]);
    
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
   * Prepare RAW resume data for AI (minimal structure, NOT formatted CV)
   * This allows AI to completely rewrite and restructure
   */
  private prepareRawResumeData(profileData: CandidateResume, insights: ATSInsights): string {
    let raw = '';
    
    // Personal Info (minimal) - check if it exists in the data
    // Note: CandidateResume might not have personalInfo directly
    const personalInfo = (profileData as any).parsedSections?.personalInfo;
    if (personalInfo) {
      raw += 'PERSONAL INFORMATION:\n';
      if (personalInfo.name) raw += `Name: ${personalInfo.name}\n`;
      if (personalInfo.email) raw += `Email: ${personalInfo.email}\n`;
      if (personalInfo.phone) raw += `Phone: ${personalInfo.phone}\n`;
      if (personalInfo.location) raw += `Location: ${personalInfo.location}\n`;
      if (personalInfo.linkedin) raw += `LinkedIn: ${personalInfo.linkedin}\n`;
      if (personalInfo.github) raw += `GitHub: ${personalInfo.github}\n`;
      raw += '\n';
    }
    
    // Skills (simple list)
    if (insights.prioritizedSkills.length > 0) {
      raw += 'SKILLS:\n';
      raw += insights.prioritizedSkills.join(', ') + '\n\n';
    }
    
    // Work Experience (raw data, no formatting)
    if (profileData.workExperience && profileData.workExperience.length > 0) {
      raw += 'WORK EXPERIENCE:\n';
      profileData.workExperience.forEach((exp, index) => {
        raw += `\nExperience ${index + 1}:\n`;
        raw += `- Role: ${exp.title}\n`;
        raw += `- Company: ${exp.company}\n`;
        if (exp.duration) raw += `- Duration: ${exp.duration}\n`;
        if (exp.location) raw += `- Location: ${exp.location}\n`;
        if (exp.yearsOfExperience) raw += `- Years: ${exp.yearsOfExperience}\n`;
        if (exp.description) raw += `- Description: ${exp.description}\n`;
        if (exp.skills && exp.skills.length > 0) {
          raw += `- Technologies: ${exp.skills.join(', ')}\n`;
        }
        if (exp.achievements && exp.achievements.length > 0) {
          raw += `- Achievements:\n`;
          exp.achievements.forEach(achievement => {
            raw += `  * ${achievement}\n`;
          });
        }
      });
      raw += '\n';
    }
    
    // Projects (raw data)
    if (profileData.projects && profileData.projects.length > 0) {
      raw += 'PROJECTS:\n';
      profileData.projects.forEach((project, index) => {
        raw += `\nProject ${index + 1}:\n`;
        raw += `- Name: ${project.name}\n`;
        raw += `- Description: ${project.description}\n`;
        if (project.role) raw += `- Role: ${project.role}\n`;
        if (project.technologies && project.technologies.length > 0) {
          raw += `- Technologies: ${project.technologies.join(', ')}\n`;
        }
        if (project.achievements && project.achievements.length > 0) {
          raw += `- Achievements:\n`;
          project.achievements.forEach(achievement => {
            raw += `  * ${achievement}\n`;
          });
        }
      });
      raw += '\n';
    }
    
    // Education (raw data)
    if (profileData.education && profileData.education.length > 0) {
      raw += 'EDUCATION:\n';
      profileData.education.forEach((edu, index) => {
        raw += `\nEducation ${index + 1}:\n`;
        raw += `- Degree: ${edu.degree}\n`;
        if (edu.field) raw += `- Field: ${edu.field}\n`;
        raw += `- Institution: ${edu.institution}\n`;
        if (edu.location) raw += `- Location: ${edu.location}\n`;
        if (edu.year) raw += `- Year: ${edu.year}\n`;
        if (edu.gpa) raw += `- GPA: ${edu.gpa}\n`;
        if (edu.honors && edu.honors.length > 0) {
          raw += `- Honors: ${edu.honors.join(', ')}\n`;
        }
      });
      raw += '\n';
    }
    
    // Certifications (simple list)
    if (profileData.certifications && profileData.certifications.length > 0) {
      raw += 'CERTIFICATIONS:\n';
      profileData.certifications.forEach(cert => {
        raw += `- ${cert}\n`;
      });
      raw += '\n';
    }
    
    return raw;
  }
  
  /**
   * Structure CV with rule-based formatting (FALLBACK ONLY)
   * This is only used when AI is not available
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
   * Transform raw resume data into CV with AI - COMPLETE REWRITE
   * AI does ALL the structuring, formatting, and expansion
   */
  private async transformWithAI(
    rawResumeData: string,
    insights: ATSInsights,
    request: CVGenerationRequest
  ): Promise<string> {
    // Infer target role if not provided
    const targetRole = request.targetRole || this.inferRoleFromJobDescription(request.jobDescription);
    
    const prompt = `You are an expert CV writer and career strategist. Your task is to COMPLETELY REWRITE the given resume data into a detailed, professional CV tailored to a specific role.

TARGET ROLE (PRIMARY FOCUS): ${targetRole}

JOB DESCRIPTION (SUPPORTING CONTEXT):
${request.jobDescription.substring(0, 500)}

ATS ANALYSIS:
- Strengths: ${insights.strengths.join(', ')}
- Gaps: ${insights.gaps.join(', ')}
- Key Skills: ${insights.prioritizedSkills.slice(0, 8).join(', ')}

RAW RESUME DATA (UNSTRUCTURED):
${rawResumeData}

---

CRITICAL UNDERSTANDING:
⚠️ IMPORTANT: The input above is NOT a CV. It is raw, unstructured resume data that must be completely rewritten into a new CV document. Do not preserve structure, phrasing, or formatting from the input. Treat this as source material to create an entirely new document.

---

STRICT INSTRUCTIONS (MANDATORY):

1. COMPLETE REWRITE (CRITICAL):
   - This is NOT an enhancement task - it's a TRANSFORMATION
   - Create an entirely new CV document from scratch
   - Do NOT copy or preserve any phrasing from the input
   - Do NOT maintain the input's structure or format
   - Think of the input as raw data points to be transformed

2. ROLE ALIGNMENT (CRITICAL):
   - Align the entire CV to the TARGET ROLE
   - Optimize tone, terminology, and focus areas based on the job title
   - Use industry-appropriate language for the role
   - Frame all experiences through the lens of the target role

3. EXPAND CONTENT SIGNIFICANTLY:
   - Each work experience MUST be 80–120 words (full paragraphs)
   - Each project MUST be 60–100 words (full paragraphs)
   - Add context, responsibilities, methodologies, and outcomes
   - Include technical depth and business impact

4. CREATE PROFESSIONAL STRUCTURE:
   - Design clear, professional section headings
   - Use narrative paragraphs (NOT bullet points)
   - Make the CV comprehensive and detailed
   - Ensure smooth flow between sections

5. ADD DEPTH AND CONTEXT:
   - Include specific technical details, tools, and methodologies
   - Add measurable impact (percentages, numbers, scale)
   - Highlight leadership, collaboration, and problem-solving
   - Explain the "why" and "how", not just the "what"

6. USE ATS INSIGHTS STRATEGICALLY:
   - Emphasize identified strengths prominently
   - Incorporate important keywords naturally throughout
   - Subtly address gaps where possible (without fabricating)
   - Align content with job requirements

7. DIFFERENTIATE FROM RESUME:
   - Output must be 3-4x more detailed than input
   - Use professional, narrative style
   - Include comprehensive context
   - Feel like a complete professional document

8. MAINTAIN INTEGRITY:
   - Do NOT invent fake experiences or skills
   - Keep all information realistic and based on input data
   - Expand and contextualize, but stay truthful

---

OUTPUT REQUIREMENTS:

- Return ONLY the final CV (no explanations, no meta-commentary)
- Use clear section headings: Professional Summary, Professional Experience, Key Projects, Technical Skills, Education, Certifications
- Use professional, narrative tone throughout
- Plain text format with clear visual separators (lines of dashes or equals signs)
- Ensure proper spacing and readability

---

FINAL CV OUTPUT:`;

    try {
      // Increase timeout for AI generation (CV transformation takes longer)
      const response = await Promise.race([
        this.watsonxClient!.generateText({
          modelId: process.env.WATSONX_MODEL_ID || 'meta-llama/llama-3-8b-instruct',
          projectId: process.env.WATSONX_PROJECT_ID!,
          input: prompt,
          parameters: {
            max_new_tokens: 3000,
            temperature: 0.4,
            top_p: 0.9,
            repetition_penalty: 1.1
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI generation timeout (60s)')), 60000)
        )
      ]) as any;
      
      // 🔥 DEBUG: Inspect raw Watsonx response
      console.log('===== WATSONX RAW RESPONSE START =====');
      console.dir(response, { depth: null });
      console.log('===== WATSONX RAW RESPONSE END =====');
      
      const generatedText = this.extractGeneratedText(response);
      
      // 🔥 DEBUG: Inspect extracted text
      console.log('===== EXTRACTED TEXT START =====');
      console.log('Length:', generatedText?.length || 0);
      console.log('First 500 chars:', generatedText?.substring(0, 500));
      console.log('Last 500 chars:', generatedText?.substring(Math.max(0, (generatedText?.length || 0) - 500)));
      console.log('===== EXTRACTED TEXT END =====');
      
      if (!generatedText || generatedText.trim().length < 100) {
        console.warn('⚠️  AI generated text too short, using structured version');
        console.warn('   Generated text length:', generatedText?.length || 0);
        console.warn('   Falling back to structureCV()');
        return this.structureCV(request.profileData, insights);
      }
      
      console.log(`✓ AI transformation successful (${generatedText.length} characters)`);
      return generatedText;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ AI transformation error:', errorMessage);
      
      // Check if it's a timeout error
      if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
        console.error('⚠️  Watsonx API timeout - the request took too long');
        console.error('   This usually means:');
        console.error('   1. Network connectivity issues');
        console.error('   2. Watsonx service is slow/overloaded');
        console.error('   3. Prompt is too long');
        console.error('   Falling back to structured CV (no AI transformation)');
      }
      
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
  
  /**
   * Infer target role from job description if not explicitly provided
   */
  private inferRoleFromJobDescription(jobDescription: string): string {
    const text = jobDescription.toLowerCase();
    
    // Common role patterns (ordered by specificity)
    const rolePatterns = [
      // Engineering roles
      { pattern: /senior\s+(?:full[\s-]?stack|fullstack)\s+(?:software\s+)?(?:engineer|developer)/i, role: 'Senior Full-Stack Engineer' },
      { pattern: /(?:full[\s-]?stack|fullstack)\s+(?:software\s+)?(?:engineer|developer)/i, role: 'Full-Stack Developer' },
      { pattern: /senior\s+frontend\s+(?:engineer|developer)/i, role: 'Senior Frontend Engineer' },
      { pattern: /frontend\s+(?:engineer|developer)/i, role: 'Frontend Developer' },
      { pattern: /senior\s+backend\s+(?:engineer|developer)/i, role: 'Senior Backend Engineer' },
      { pattern: /backend\s+(?:engineer|developer)/i, role: 'Backend Developer' },
      { pattern: /senior\s+(?:software\s+)?(?:engineer|developer)/i, role: 'Senior Software Engineer' },
      { pattern: /(?:software\s+)?(?:engineer|developer)/i, role: 'Software Engineer' },
      { pattern: /lead\s+(?:software\s+)?(?:engineer|developer)/i, role: 'Lead Software Engineer' },
      { pattern: /principal\s+(?:software\s+)?engineer/i, role: 'Principal Software Engineer' },
      { pattern: /staff\s+(?:software\s+)?engineer/i, role: 'Staff Software Engineer' },
      
      // Specialized engineering
      { pattern: /devops\s+engineer/i, role: 'DevOps Engineer' },
      { pattern: /site\s+reliability\s+engineer|sre/i, role: 'Site Reliability Engineer' },
      { pattern: /data\s+engineer/i, role: 'Data Engineer' },
      { pattern: /machine\s+learning\s+engineer/i, role: 'Machine Learning Engineer' },
      { pattern: /cloud\s+engineer/i, role: 'Cloud Engineer' },
      { pattern: /security\s+engineer/i, role: 'Security Engineer' },
      { pattern: /qa\s+engineer|quality\s+assurance/i, role: 'QA Engineer' },
      
      // Mobile
      { pattern: /(?:senior\s+)?(?:ios|iphone)\s+developer/i, role: 'iOS Developer' },
      { pattern: /(?:senior\s+)?android\s+developer/i, role: 'Android Developer' },
      { pattern: /(?:senior\s+)?mobile\s+(?:app\s+)?developer/i, role: 'Mobile Developer' },
      
      // Data & Analytics
      { pattern: /data\s+scientist/i, role: 'Data Scientist' },
      { pattern: /data\s+analyst/i, role: 'Data Analyst' },
      { pattern: /business\s+intelligence/i, role: 'Business Intelligence Analyst' },
      
      // Product & Design
      { pattern: /product\s+manager/i, role: 'Product Manager' },
      { pattern: /(?:senior\s+)?ux\s+designer/i, role: 'UX Designer' },
      { pattern: /(?:senior\s+)?ui\s+designer/i, role: 'UI Designer' },
      { pattern: /(?:senior\s+)?ui\/ux\s+designer/i, role: 'UI/UX Designer' },
      
      // Management
      { pattern: /engineering\s+manager/i, role: 'Engineering Manager' },
      { pattern: /technical\s+lead/i, role: 'Technical Lead' },
      { pattern: /team\s+lead/i, role: 'Team Lead' },
      { pattern: /architect/i, role: 'Software Architect' },
      
      // Marketing & Business
      { pattern: /digital\s+marketing/i, role: 'Digital Marketing Specialist' },
      { pattern: /marketing\s+manager/i, role: 'Marketing Manager' },
      { pattern: /content\s+(?:marketing\s+)?manager/i, role: 'Content Marketing Manager' },
      { pattern: /business\s+analyst/i, role: 'Business Analyst' },
      { pattern: /project\s+manager/i, role: 'Project Manager' },
    ];
    
    // Try to match specific role patterns
    for (const { pattern, role } of rolePatterns) {
      if (pattern.test(jobDescription)) {
        console.log(`✓ Inferred role from job description: ${role}`);
        return role;
      }
    }
    
    // Fallback: Try to extract from first line or title
    const lines = jobDescription.split('\n');
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 100) {
      // Likely a job title
      console.log(`✓ Using first line as role: ${firstLine}`);
      return firstLine;
    }
    
    // Final fallback
    console.log('⚠️  Could not infer role, using generic fallback');
    return 'Professional Position';
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
      let text: string | null = null;
      
      if ((response.result as any)?.generated_text) {
        text = (response.result as any).generated_text;
      } else if ((response.result as any)?.results?.[0]?.generated_text) {
        text = (response.result as any).results[0].generated_text;
      } else if ((response as any)?.generated_text) {
        text = (response as any).generated_text;
      } else if ((response as any)?.results?.[0]?.generated_text) {
        text = (response as any).results[0].generated_text;
      }
      
      if (!text) {
        return null;
      }
      
      // Clean up markdown code fences if present
      // AI sometimes wraps output in ```...```
      text = text.trim();
      
      // Remove leading code fence (```\n or ```markdown\n or ```text\n)
      if (text.startsWith('```')) {
        const firstNewline = text.indexOf('\n');
        if (firstNewline !== -1) {
          text = text.substring(firstNewline + 1);
        }
      }
      
      // Remove trailing code fence (\n```)
      if (text.endsWith('```')) {
        const lastCodeFence = text.lastIndexOf('\n```');
        if (lastCodeFence !== -1) {
          text = text.substring(0, lastCodeFence);
        } else {
          // Just remove the trailing ```
          text = text.substring(0, text.length - 3);
        }
      }
      
      // Final trim
      text = text.trim();
      
      console.log('🧹 Cleaned text (removed markdown fences if present)');
      console.log('   Final length:', text.length);
      
      return text;
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
