# CV Generator MVP Implementation Plan
## Simplified, Production-Ready Approach

**Date:** May 3, 2026  
**Status:** 🚀 Ready to Implement  
**Goal:** Working CV generator with ATS reuse and AI enhancement in ONE pass

---

## 🎯 Key Simplifications

### 1. **ONE AI Call** (Not Two)
- ❌ Separate expansion + personalization layers
- ✅ Single `expandAndPersonalizeCV()` call
- **Benefit:** 50% faster, 50% cheaper, easier to debug

### 2. **Backend Fallback** (Not Hard Dependency)
- ❌ Frontend must provide ATS insights or fail
- ✅ Backend recomputes if missing
- **Benefit:** Resilient to refresh, easier to scale

### 3. **Simple Service API** (Not Over-Modular)
- ❌ 4 separate functions exposed
- ✅ One main function: `generateFullCV()`
- **Benefit:** Cleaner interface, easier to maintain

### 4. **Shorter Prompts** (Token Efficiency)
- ❌ 150-200 words per experience
- ✅ 80-120 words per experience
- **Benefit:** Faster, cheaper, still effective

### 5. **Caching Built-In** (Performance Win)
- ✅ Cache ATS insights
- ✅ Cache generated CVs
- **Benefit:** Huge performance improvement

---

## 🏗️ Optimized Architecture

```
┌─────────────────┐
│ Parsed Resume   │
└────────┬────────┘
         │
         ▼
    ┌───────────────────┐
    │  ATS Engine       │
    │  (with caching)   │
    └────────┬──────────┘
             │
             │ ATS Insights (cached)
             ▼
    ┌───────────────────┐
    │ CV Generator      │
    │  ├─ Rule Structure│
    │  └─ AI (1 pass)   │
    │     Expand +      │
    │     Personalize   │
    └────────┬──────────┘
             │
             ▼
         ┌──────┐
         │  CV  │ (cached)
         └──────┘
```

---

## 📝 Implementation Steps

### Step 1: Create Simple CV Generator Service
**File:** `server/src/services/cvGeneratorService.ts`

```typescript
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
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class CVGeneratorService {
  private watsonxClient: WatsonXAI | null = null;
  
  constructor() {
    const apiKey = process.env.WATSONX_API_KEY || '';
    const projectId = process.env.WATSONX_PROJECT_ID || '';
    
    if (apiKey && projectId) {
      this.watsonxClient = new WatsonXAI({
        version: '2023-05-29',
        serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
        authenticator: new IamAuthenticator({ apikey: apiKey })
      });
    }
  }
  
  /**
   * Main entry point - generates full CV with AI enhancement
   */
  async generateFullCV(request: CVGenerationRequest): Promise<string> {
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = cvCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✓ Returning cached CV');
      return cached.cv;
    }
    
    // Get or compute ATS insights
    let insights = request.atsInsights;
    if (!insights) {
      console.log('⚠️  No ATS insights provided, computing...');
      insights = this.computeATSInsights(request.profileData, request.jobDescription);
    }
    
    // Step 1: Structure CV with rules
    const structured = this.structureCV(request.profileData, insights);
    
    // Step 2: Enhance with AI (single pass)
    let finalCV: string;
    if (this.watsonxClient) {
      try {
        finalCV = await this.enhanceWithAI(structured, insights, request);
      } catch (error) {
        console.error('AI enhancement failed, using structured version:', error);
        finalCV = structured;
      }
    } else {
      console.warn('Watsonx not available, using structured version');
      finalCV = structured;
    }
    
    // Cache result
    cvCache.set(cacheKey, { cv: finalCV, timestamp: Date.now() });
    
    return finalCV;
  }
  
  /**
   * Compute ATS insights if not provided (fallback)
   */
  private computeATSInsights(
    profileData: CandidateResume,
    jobDescription: string
  ): ATSInsights {
    // Extract keywords from job description
    const keywords = this.extractKeywords(jobDescription);
    
    // Analyze profile
    const resumeText = JSON.stringify(profileData).toLowerCase();
    const matchedKeywords = keywords.filter(k => resumeText.includes(k.toLowerCase()));
    const keywordMatchRate = (matchedKeywords.length / Math.max(keywords.length, 1)) * 100;
    
    // Identify gaps
    const gaps: string[] = [];
    if (!profileData.skills || profileData.skills.length < 5) {
      gaps.push('Limited technical skills');
    }
    if (!profileData.workExperience || profileData.workExperience.length === 0) {
      gaps.push('Missing work experience details');
    }
    
    // Identify strengths
    const strengths: string[] = [];
    if (keywordMatchRate > 60) {
      strengths.push('Strong keyword alignment');
    }
    if (profileData.skills && profileData.skills.length >= 8) {
      strengths.push('Comprehensive skill set');
    }
    
    // Calculate score
    const score = Math.min(Math.round(keywordMatchRate + 20), 100);
    
    // Prioritize skills
    const prioritizedSkills = this.prioritizeSkills(profileData.skills || [], keywords);
    
    return { keywords, gaps, strengths, score, prioritizedSkills };
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
        cv += '\n';
        cv += '·'.repeat(70) + '\n';
        
        if (exp.description) {
          cv += `${exp.description}\n\n`;
        }
        
        if (exp.skills && exp.skills.length > 0) {
          cv += 'Key Technologies:\n';
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
      
      profileData.projects.forEach(project => {
        cv += `${project.name}\n`;
        cv += '·'.repeat(70) + '\n';
        cv += `${project.description}\n`;
        
        if (project.technologies && project.technologies.length > 0) {
          cv += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        
        cv += '\n';
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
        if (edu.year) cv += ` | ${edu.year}`;
        cv += '\n\n';
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
    
    return cv;
  }
  
  /**
   * Enhance CV with AI - SINGLE PASS (expansion + personalization)
   */
  private async enhanceWithAI(
    structuredCV: string,
    insights: ATSInsights,
    request: CVGenerationRequest
  ): Promise<string> {
    const prompt = `You are an expert CV writer. Enhance this CV by expanding descriptions and personalizing for the target role.

TARGET ROLE: ${request.targetRole || 'Professional position'}

JOB REQUIREMENTS:
${request.jobDescription.substring(0, 500)}

ATS ANALYSIS:
- Strengths: ${insights.strengths.join(', ')}
- Gaps to address: ${insights.gaps.join(', ')}
- Key skills: ${insights.prioritizedSkills.slice(0, 5).join(', ')}

CURRENT CV:
${structuredCV}

INSTRUCTIONS:
1. Expand work experience descriptions to 80-120 words each
2. Add technical depth to project descriptions (60-100 words)
3. Emphasize the identified strengths
4. Subtly address gaps where possible
5. Maintain professional tone appropriate for seniority level
6. Keep all factual information accurate
7. Use action verbs and quantifiable achievements
8. Ensure consistency throughout

OUTPUT: Enhanced CV (plain text, same format)

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
      return generatedText || structuredCV;
    } catch (error) {
      console.error('AI enhancement error:', error);
      return structuredCV;
    }
  }
  
  // Helper methods
  
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
      /\b(react|vue|angular|javascript|typescript|node\.?js|python|java|c\+\+|c#|go|rust)\b/gi,
      /\b(html|css|sass|tailwind|bootstrap)\b/gi,
      /\b(express|django|flask|spring|laravel)\b/gi,
      /\b(mysql|postgresql|mongodb|redis)\b/gi,
      /\b(docker|kubernetes|aws|azure|gcp)\b/gi,
      /\b(git|ci\/cd|agile|scrum)\b/gi,
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
    
    return `Accomplished professional with ${years}+ years of comprehensive experience in ${topSkills.join(', ')}. ${insights.strengths.join('. ')}. Proven track record of delivering high-impact solutions and driving organizational success through technical excellence and collaborative leadership.`;
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
}
```

### Step 2: Update API Route (Minimal Changes)
**File:** `server/src/app/api/resume/generate/route.ts`

Just add CV generator integration:

```typescript
import { CVGeneratorService } from '@/services/cvGeneratorService';

// In POST handler, for full-cv:
if (resumeType === 'full-cv') {
  const cvGenerator = new CVGeneratorService();
  const cv = await cvGenerator.generateFullCV({
    profileData,
    jobDescription,
    atsInsights, // Optional - will compute if missing
    targetRole
  });
  
  return NextResponse.json({
    generatedResume: cv,
    format: 'plain',
    suggestions: [],
    weakSections: [],
    timestamp: new Date().toISOString()
  }, { headers: corsHeaders });
}
```

### Step 3: Update Frontend (No Breaking Changes)
**File:** `client/src/hooks/useResumeBuilder.ts`

Frontend can still pass insights if available, but not required:

```typescript
const generateFullCV = useCallback(async () => {
  setState(prev => ({ ...prev, loading: true, error: null }));
  
  try {
    const response = await generateResume({
      profileData: state.parsedData,
      jobDescription: state.jobDescription,
      resumeType: 'full-cv',
      atsInsights: state.atsInsights, // Pass if available, backend will handle if missing
    });
    
    setState(prev => ({
      ...prev,
      fullCV: response,
      loading: false,
      currentStep: 'results',
    }));
  } catch (error) {
    // ... error handling ...
  }
}, [state.parsedData, state.jobDescription, state.atsInsights]);
```

---

## ✅ Benefits of This Approach

1. **50% Faster** - One AI call instead of two
2. **50% Cheaper** - Half the tokens
3. **More Resilient** - Backend fallback for missing insights
4. **Easier to Debug** - Single AI prompt to tune
5. **Cached** - Huge performance win for repeated requests
6. **Simpler Code** - One service, one main function
7. **Production Ready** - Handles errors gracefully

---

## 📊 Performance Comparison

### Old Approach (Overengineered)
- ATS Generation: 2-3s
- CV Expansion Layer: 3-4s
- CV Personalization Layer: 3-4s
- **Total: 8-11 seconds**

### New Approach (MVP)
- ATS Generation: 2-3s (cached after first run)
- CV Generation (1 AI pass): 3-4s
- **Total: 5-7 seconds (first run)**
- **Total: 3-4 seconds (cached ATS)**

---

## 🚀 Implementation Time

- Step 1: Create CV service: **1 hour**
- Step 2: Update API route: **15 minutes**
- Step 3: Update frontend: **15 minutes**
- Testing: **30 minutes**

**Total: 2 hours** (vs. 5.5 hours in overengineered plan)

---

## 🎯 Success Criteria

✅ CV is more detailed than ATS resume  
✅ CV uses ATS insights when available  
✅ CV works even without ATS insights (fallback)  
✅ Single AI call for enhancement  
✅ Caching works  
✅ Error handling graceful  
✅ 50% faster than two-layer approach  

---

**Status:** Ready to implement  
**Estimated Time:** 2 hours  
**Next:** Create `cvGeneratorService.ts`
