# 💡 AI Agent Code Examples

This guide provides practical code examples you can use and modify for your AI features.

## 📋 Table of Contents

1. [Basic Email Generation](#basic-email-generation)
2. [Custom AI Features](#custom-ai-features)
3. [Resume Analysis](#resume-analysis)
4. [Integration Examples](#integration-examples)
5. [Testing Examples](#testing-examples)

---

## 📧 Basic Email Generation

### Example 1: Simple Email Generator Component

```typescript
// File: client/src/components/SimpleEmailGenerator.tsx

import { useState } from 'react';
import { useWatsonxEmailGenerator } from '../hooks/useWatsonxEmailGenerator';

export function SimpleEmailGenerator() {
  const [message, setMessage] = useState('');
  const { result, loading, error, generateDraft } = useWatsonxEmailGenerator();

  const handleGenerate = async () => {
    await generateDraft({
      purpose: 'job-application',
      tone: 'professional',
      refinement: 'none',
      contextMessage: '',
      yourMessage: message,
      recipientInfo: '',
      extraInstruction: ''
    });
  };

  return (
    <div className="email-generator">
      <h2>Quick Email Generator</h2>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What do you want to say?"
        rows={5}
      />
      
      <button 
        onClick={handleGenerate}
        disabled={loading || message.length < 10}
      >
        {loading ? 'Generating...' : 'Generate Email'}
      </button>
      
      {error && (
        <div className="error">{error}</div>
      )}
      
      {result && (
        <div className="result">
          <h3>Subject: {result.subject}</h3>
          <pre>{result.body}</pre>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Email Generator with All Options

```typescript
// File: client/src/components/AdvancedEmailGenerator.tsx

import { useState } from 'react';
import { useWatsonxEmailGenerator } from '../hooks/useWatsonxEmailGenerator';
import type { EmailFormValues } from '../utilities/system-utils/emailGenerator';

export function AdvancedEmailGenerator() {
  const [formData, setFormData] = useState<EmailFormValues>({
    purpose: 'job-application',
    tone: 'professional',
    refinement: 'none',
    contextMessage: '',
    yourMessage: '',
    recipientInfo: '',
    extraInstruction: '',
    targetLanguage: 'en',
    culturalAdaptation: true
  });

  const { result, loading, error, generateDraft, reset } = useWatsonxEmailGenerator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateDraft(formData);
  };

  const handleChange = (field: keyof EmailFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="advanced-email-generator">
      <form onSubmit={handleSubmit}>
        {/* Purpose Selection */}
        <div className="form-group">
          <label>Email Purpose</label>
          <select
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
          >
            <option value="job-application">Job Application</option>
            <option value="follow-up">Follow-up</option>
            <option value="thank-you">Thank You</option>
            <option value="networking">Networking</option>
            <option value="inquiry">Inquiry</option>
          </select>
        </div>

        {/* Tone Selection */}
        <div className="form-group">
          <label>Tone</label>
          <select
            value={formData.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
          >
            <option value="formal">Formal</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>

        {/* Context */}
        <div className="form-group">
          <label>Context (Job Description, Previous Email, etc.)</label>
          <textarea
            value={formData.contextMessage}
            onChange={(e) => handleChange('contextMessage', e.target.value)}
            placeholder="Paste job description or previous conversation..."
            rows={4}
          />
        </div>

        {/* Your Message */}
        <div className="form-group">
          <label>What do you want to say? *</label>
          <textarea
            value={formData.yourMessage}
            onChange={(e) => handleChange('yourMessage', e.target.value)}
            placeholder="Write your rough message here..."
            rows={4}
            required
          />
        </div>

        {/* Recipient Info */}
        <div className="form-group">
          <label>Recipient Information</label>
          <input
            type="text"
            value={formData.recipientInfo}
            onChange={(e) => handleChange('recipientInfo', e.target.value)}
            placeholder="Company name, person's name, etc."
          />
        </div>

        {/* Extra Instructions */}
        <div className="form-group">
          <label>Additional Instructions (Optional)</label>
          <input
            type="text"
            value={formData.extraInstruction}
            onChange={(e) => handleChange('extraInstruction', e.target.value)}
            placeholder="Any special requirements..."
          />
        </div>

        {/* Refinement */}
        <div className="form-group">
          <label>Refinement</label>
          <select
            value={formData.refinement}
            onChange={(e) => handleChange('refinement', e.target.value)}
          >
            <option value="none">No refinement</option>
            <option value="shorter">Make it shorter</option>
            <option value="longer">Make it longer</option>
            <option value="more-formal">More formal</option>
            <option value="more-casual">More casual</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Email'}
          </button>
          <button type="button" onClick={reset}>
            Clear
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="email-result">
          <h3>Generated Email</h3>
          
          <div className="email-subject">
            <label>Subject:</label>
            <input type="text" value={result.subject} readOnly />
          </div>
          
          <div className="email-body">
            <label>Body:</label>
            <textarea value={result.body} readOnly rows={15} />
          </div>
          
          <div className="email-actions">
            <button onClick={() => navigator.clipboard.writeText(result.body)}>
              Copy to Clipboard
            </button>
            <button onClick={() => {/* Download as file */}}>
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Custom AI Features

### Example 3: LinkedIn Message Generator

```typescript
// File: client/src/services/linkedinService.ts

import { requestWatsonxText } from './watsonxService';

export interface LinkedInMessageRequest {
  purpose: 'connection' | 'job-inquiry' | 'referral' | 'follow-up';
  recipientName: string;
  recipientTitle: string;
  recipientCompany: string;
  yourBackground: string;
  commonGround?: string; // Shared connections, interests, etc.
}

export async function generateLinkedInMessage(
  request: LinkedInMessageRequest
): Promise<string> {
  const prompt = buildLinkedInPrompt(request);
  const response = await requestWatsonxText({ prompt });
  return cleanLinkedInMessage(response.text);
}

function buildLinkedInPrompt(request: LinkedInMessageRequest): string {
  const purposeInstructions = {
    'connection': 'Write a connection request message',
    'job-inquiry': 'Write a message inquiring about job opportunities',
    'referral': 'Write a message asking for a job referral',
    'follow-up': 'Write a follow-up message after initial connection'
  };

  return `
You are a LinkedIn messaging assistant.

Task: ${purposeInstructions[request.purpose]}

Recipient Information:
- Name: ${request.recipientName}
- Title: ${request.recipientTitle}
- Company: ${request.recipientCompany}

Your Background:
${request.yourBackground}

${request.commonGround ? `Common Ground:\n${request.commonGround}` : ''}

Requirements:
- Keep it under 300 characters (LinkedIn connection request limit)
- Be professional but personable
- Mention why you're reaching out
- Include a clear call-to-action
- Don't be pushy or salesy

Return only the message text, nothing else.
  `.trim();
}

function cleanLinkedInMessage(text: string): string {
  // Remove any extra formatting
  let cleaned = text.trim();
  
  // Ensure it's under 300 characters
  if (cleaned.length > 300) {
    cleaned = cleaned.substring(0, 297) + '...';
  }
  
  return cleaned;
}
```

**Usage:**
```typescript
const message = await generateLinkedInMessage({
  purpose: 'connection',
  recipientName: 'John Doe',
  recipientTitle: 'Senior Software Engineer',
  recipientCompany: 'Google',
  yourBackground: 'Software developer with 3 years experience in React',
  commonGround: 'We both attended Stanford University'
});

console.log(message);
// Output: "Hi John! Fellow Stanford alum here. I'm impressed by your work at Google. 
// I'm a React developer looking to learn from experienced engineers. Would love to connect!"
```

### Example 4: Cover Letter Generator

```typescript
// File: client/src/services/coverLetterService.ts

import { requestWatsonxText } from './watsonxService';

export interface CoverLetterRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  yourName: string;
  yourSkills: string[];
  yourExperience: string;
  whyInterested: string;
}

export async function generateCoverLetter(
  request: CoverLetterRequest
): Promise<string> {
  const prompt = `
You are a professional cover letter writer.

Generate a one-page cover letter for:

Job Title: ${request.jobTitle}
Company: ${request.companyName}

Job Description:
${request.jobDescription}

Candidate Information:
Name: ${request.yourName}
Skills: ${request.yourSkills.join(', ')}
Experience: ${request.yourExperience}
Why interested: ${request.whyInterested}

Structure:
1. Opening paragraph: Express interest and mention how you found the position
2. Body paragraph 1: Highlight relevant skills and experience
3. Body paragraph 2: Explain why you're interested in the company
4. Closing paragraph: Call to action and thank you

Requirements:
- Professional and engaging tone
- Specific examples from experience
- Show enthusiasm for the role
- Keep it to one page (around 300-400 words)
- Use proper business letter format

Return only the cover letter text.
  `.trim();

  const response = await requestWatsonxText({ prompt });
  return response.text;
}
```

### Example 5: Interview Question Generator

```typescript
// File: client/src/services/interviewPrepService.ts

import { requestWatsonxText } from './watsonxService';

export interface InterviewQuestionsRequest {
  jobTitle: string;
  jobDescription: string;
  candidateSkills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export async function generateInterviewQuestions(
  request: InterviewQuestionsRequest
): Promise<string[]> {
  const prompt = `
You are an interview preparation assistant.

Generate ${request.questionCount} interview questions for:

Job Title: ${request.jobTitle}
Difficulty: ${request.difficulty}

Job Description:
${request.jobDescription}

Candidate Skills:
${request.candidateSkills.join(', ')}

Requirements:
- Mix of technical and behavioral questions
- Relevant to the job description
- Appropriate difficulty level
- Include follow-up questions
- Cover different aspects (coding, system design, teamwork, etc.)

Return questions in this format:
Q1: [Question text]
Q2: [Question text]
...
  `.trim();

  const response = await requestWatsonxText({ prompt });
  
  // Parse questions
  const questions = response.text
    .split(/Q\d+:/)
    .filter(q => q.trim())
    .map(q => q.trim());
  
  return questions;
}

// Generate sample answers
export async function generateSampleAnswer(
  question: string,
  candidateBackground: string
): Promise<string> {
  const prompt = `
You are an interview coach.

Question: ${question}

Candidate Background:
${candidateBackground}

Generate a strong sample answer that:
- Uses the STAR method (Situation, Task, Action, Result) for behavioral questions
- Provides clear technical explanations for technical questions
- Shows confidence and competence
- Is concise but complete (2-3 minutes speaking time)

Return only the sample answer.
  `.trim();

  const response = await requestWatsonxText({ prompt });
  return response.text;
}
```

---

## 🎯 Resume Analysis

### Example 6: Resume Skill Extractor

```typescript
// File: client/src/utilities/resumeAnalyzer.ts

export interface SkillCategory {
  category: string;
  skills: string[];
}

export function categorizeSkills(skills: string[]): SkillCategory[] {
  const categories: Record<string, string[]> = {
    'Programming Languages': [],
    'Frontend': [],
    'Backend': [],
    'Databases': [],
    'Cloud & DevOps': [],
    'Tools & Methodologies': [],
    'Soft Skills': []
  };

  const skillMap: Record<string, string> = {
    // Programming Languages
    'javascript': 'Programming Languages',
    'typescript': 'Programming Languages',
    'python': 'Programming Languages',
    'java': 'Programming Languages',
    'c++': 'Programming Languages',
    
    // Frontend
    'react': 'Frontend',
    'vue': 'Frontend',
    'angular': 'Frontend',
    'html': 'Frontend',
    'css': 'Frontend',
    
    // Backend
    'node.js': 'Backend',
    'express': 'Backend',
    'django': 'Backend',
    'flask': 'Backend',
    'spring': 'Backend',
    
    // Databases
    'mysql': 'Databases',
    'postgresql': 'Databases',
    'mongodb': 'Databases',
    'redis': 'Databases',
    
    // Cloud & DevOps
    'aws': 'Cloud & DevOps',
    'azure': 'Cloud & DevOps',
    'docker': 'Cloud & DevOps',
    'kubernetes': 'Cloud & DevOps',
    
    // Tools
    'git': 'Tools & Methodologies',
    'jira': 'Tools & Methodologies',
    'agile': 'Tools & Methodologies',
    
    // Soft Skills
    'leadership': 'Soft Skills',
    'communication': 'Soft Skills',
    'teamwork': 'Soft Skills'
  };

  skills.forEach(skill => {
    const category = skillMap[skill.toLowerCase()] || 'Other';
    if (categories[category]) {
      categories[category].push(skill);
    }
  });

  return Object.entries(categories)
    .filter(([_, skills]) => skills.length > 0)
    .map(([category, skills]) => ({ category, skills }));
}
```

### Example 7: Resume Strength Analyzer

```typescript
// File: client/src/utilities/resumeStrengthAnalyzer.ts

export interface ResumeStrength {
  overallScore: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
  };
  suggestions: string[];
}

export function analyzeResumeStrength(resumeData: any): ResumeStrength {
  const breakdown = {
    skills: calculateSkillsScore(resumeData.skills),
    experience: calculateExperienceScore(resumeData.workExperience),
    education: calculateEducationScore(resumeData.education),
    projects: calculateProjectsScore(resumeData.projects),
    certifications: calculateCertificationsScore(resumeData.certifications)
  };

  const overallScore = Math.round(
    (breakdown.skills * 0.3) +
    (breakdown.experience * 0.3) +
    (breakdown.education * 0.15) +
    (breakdown.projects * 0.15) +
    (breakdown.certifications * 0.1)
  );

  const suggestions = generateSuggestions(breakdown);

  return { overallScore, breakdown, suggestions };
}

function calculateSkillsScore(skills: string[]): number {
  if (skills.length >= 15) return 100;
  if (skills.length >= 10) return 80;
  if (skills.length >= 5) return 60;
  if (skills.length >= 3) return 40;
  return 20;
}

function calculateExperienceScore(experience: any[]): number {
  if (!experience || experience.length === 0) return 0;
  
  const years = experience.reduce((total, exp) => {
    // Calculate years from dates
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);

  if (years >= 5) return 100;
  if (years >= 3) return 80;
  if (years >= 1) return 60;
  return 40;
}

function calculateEducationScore(education: any[]): number {
  if (!education || education.length === 0) return 0;
  
  const hasMasters = education.some(e => 
    e.degree.toLowerCase().includes('master')
  );
  const hasBachelors = education.some(e => 
    e.degree.toLowerCase().includes('bachelor')
  );

  if (hasMasters) return 100;
  if (hasBachelors) return 80;
  return 60;
}

function calculateProjectsScore(projects: any[]): number {
  if (!projects) return 0;
  
  if (projects.length >= 5) return 100;
  if (projects.length >= 3) return 80;
  if (projects.length >= 1) return 60;
  return 0;
}

function calculateCertificationsScore(certifications: string[]): number {
  if (!certifications) return 0;
  
  if (certifications.length >= 3) return 100;
  if (certifications.length >= 2) return 80;
  if (certifications.length >= 1) return 60;
  return 0;
}

function generateSuggestions(breakdown: any): string[] {
  const suggestions: string[] = [];

  if (breakdown.skills < 60) {
    suggestions.push('Add more technical skills to strengthen your profile');
  }
  if (breakdown.experience < 60) {
    suggestions.push('Include more work experience or internships');
  }
  if (breakdown.education < 60) {
    suggestions.push('Add your educational background');
  }
  if (breakdown.projects < 60) {
    suggestions.push('Showcase more projects to demonstrate practical skills');
  }
  if (breakdown.certifications < 60) {
    suggestions.push('Consider adding relevant certifications');
  }

  return suggestions;
}
```

---

## 🔗 Integration Examples

### Example 8: Integrating with Your Backend

```typescript
// File: client/src/services/aiIntegrationService.ts

import { requestWatsonxText } from './watsonxService';

// Generic AI request wrapper
export async function makeAIRequest<T>(
  prompt: string,
  parser: (text: string) => T
): Promise<T> {
  try {
    const response = await requestWatsonxText({ prompt });
    return parser(response.text);
  } catch (error) {
    console.error('AI request failed:', error);
    throw new Error('Failed to process AI request');
  }
}

// Example: Email generation
export async function generateEmail(userInput: string): Promise<{
  subject: string;
  body: string;
}> {
  const prompt = `Generate a professional email based on: ${userInput}`;
  
  return makeAIRequest(prompt, (text) => {
    const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
    const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i);
    
    return {
      subject: subjectMatch?.[1]?.trim() || 'No Subject',
      body: bodyMatch?.[1]?.trim() || text
    };
  });
}

// Example: Skill extraction
export async function extractSkills(resumeText: string): Promise<string[]> {
  const prompt = `
Extract technical skills from this resume:
${resumeText}

Return only a comma-separated list of skills.
  `.trim();
  
  return makeAIRequest(prompt, (text) => {
    return text
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  });
}
```

---

## 🧪 Testing Examples

### Example 9: Unit Tests for AI Functions

```typescript
// File: client/src/utilities/__tests__/emailGenerator.test.ts

import { describe, it, expect } from 'vitest';
import {
  validateEmailInput,
  buildEmailPrompt,
  extractEmailDraft
} from '../system-utils/emailGenerator';

describe('Email Generator', () => {
  describe('validateEmailInput', () => {
    it('should return error for empty message', () => {
      const errors = validateEmailInput({
        purpose: 'job-application',
        tone: 'professional',
        refinement: 'none',
        contextMessage: '',
        yourMessage: '',
        recipientInfo: '',
        extraInstruction: ''
      });
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('at least 10 characters');
    });

    it('should pass validation for valid input', () => {
      const errors = validateEmailInput({
        purpose: 'job-application',
        tone: 'professional',
        refinement: 'none',
        contextMessage: 'Job description',
        yourMessage: 'I want to apply for this position',
        recipientInfo: 'IBM',
        extraInstruction: ''
      });
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('buildEmailPrompt', () => {
    it('should include all form values in prompt', () => {
      const prompt = buildEmailPrompt({
        purpose: 'job-application',
        tone: 'professional',
        refinement: 'none',
        contextMessage: 'Software Engineer at IBM',
        yourMessage: 'I have 3 years experience',
        recipientInfo: 'IBM Hiring Team',
        extraInstruction: 'Mention React skills'
      });
      
      expect(prompt).toContain('Job application');
      expect(prompt).toContain('professional');
      expect(prompt).toContain('Software Engineer at IBM');
      expect(prompt).toContain('I have 3 years experience');
      expect(prompt).toContain('IBM Hiring Team');
      expect(prompt).toContain('Mention React skills');
    });
  });

  describe('extractEmailDraft', () => {
    it('should extract subject and body from AI response', () => {
      const aiResponse = `
SUBJECT: Application for Software Engineer Position
BODY:
Dear Hiring Team,

I am writing to apply for the Software Engineer position.

Best regards
      `.trim();
      
      const result = extractEmailDraft(aiResponse, {
        purpose: 'job-application',
        tone: 'professional',
        refinement: 'none',
        contextMessage: '',
        yourMessage: '',
        recipientInfo: '',
        extraInstruction: ''
      });
      
      expect(result.subject).toBe('Application for Software Engineer Position');
      expect(result.body).toContain('Dear Hiring Team');
      expect(result.body).toContain('Best regards');
    });
  });
});
```

### Example 10: Integration Tests

```typescript
// File: client/src/services/__tests__/watsonxService.test.ts

import { describe, it, expect, vi } from 'vitest';
import { requestWatsonxText } from '../watsonxService';

// Mock fetch
global.fetch = vi.fn();

describe('Watsonx Service', () => {
  it('should make successful API request', async () => {
    const mockResponse = {
      data: {
        text: 'Generated email text',
        modelId: 'ibm/granite-13b-chat-v2',
        region: 'us-south'
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await requestWatsonxText({
      prompt: 'Generate an email'
    });

    expect(result.text).toBe('Generated email text');
    expect(result.modelId).toBe('ibm/granite-13b-chat-v2');
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' })
    });

    await expect(
      requestWatsonxText({ prompt: 'Test' })
    ).rejects.toThrow('API Error');
  });
});
```

---

## 📝 Summary

These code examples show you how to:
- ✅ Build email generation components
- ✅ Create custom AI features (LinkedIn messages, cover letters, etc.)
- ✅ Analyze resumes and extract skills
- ✅ Integrate AI into your application
- ✅ Write tests for AI functionality

**Key Takeaways:**
1. Always validate user input before sending to AI
2. Build clear, detailed prompts for better results
3. Parse and clean AI responses properly
4. Handle errors gracefully
5. Test your AI integrations thoroughly

**Next Steps:**
- Copy and modify these examples for your needs
- Experiment with different prompts
- Add error handling and loading states
- Test with various inputs

Happy coding! 🚀