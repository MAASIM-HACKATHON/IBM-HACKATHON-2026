/**
 * Resume Service
 * Handles resume generation, parsing, and AI-powered optimization
 */

import type {
  ResumeGenerationRequest,
  ResumeGenerationResponse,
  JobDescriptionAnalysis,
  ParsedResumeData,
  ApplicationEmailRequest,
  ApplicationEmailResponse,
} from '../types/resume.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Generate AI-powered resume (ATS-optimized or Full CV)
 */
export async function generateResume(
  request: ResumeGenerationRequest
): Promise<ResumeGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/resume/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate resume');
  }

  return response.json();
}

/**
 * Analyze job description and extract key information
 */
export async function analyzeJobDescription(
  jobDescription: string
): Promise<JobDescriptionAnalysis> {
  const response = await fetch(`${API_BASE_URL}/resume/analyze-jd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobDescription }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze job description');
  }

  return response.json();
}

/**
 * Parse uploaded resume file (PDF/DOCX)
 */
export async function parseResumeFile(file: File): Promise<ParsedResumeData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/resume/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse resume file');
  }

  return response.json();
}

/**
 * Generate application email based on resume and job description
 */
export async function generateApplicationEmail(
  request: ApplicationEmailRequest
): Promise<ApplicationEmailResponse> {
  const response = await fetch(`${API_BASE_URL}/resume/generate-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate application email');
  }

  return response.json();
}

/**
 * Client-side job description analysis (basic extraction)
 */
export function extractJobKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const keywords: string[] = [];

  // Common skill patterns
  const skillPatterns = [
    /\b(react|vue|angular|javascript|typescript|node\.?js|python|java|c\+\+|c#|go|rust)\b/gi,
    /\b(html|css|sass|less|tailwind|bootstrap)\b/gi,
    /\b(express|django|flask|spring|laravel|rails)\b/gi,
    /\b(mysql|postgresql|mongodb|redis|elasticsearch)\b/gi,
    /\b(docker|kubernetes|aws|azure|gcp|google cloud)\b/gi,
    /\b(git|ci\/cd|jenkins|github actions|gitlab)\b/gi,
    /\b(rest|graphql|api|microservices)\b/gi,
    /\b(agile|scrum|kanban|jira)\b/gi,
  ];

  skillPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = normalizeSkill(match);
        if (!keywords.includes(normalized)) {
          keywords.push(normalized);
        }
      });
    }
  });

  return keywords;
}

/**
 * Normalize skill names
 */
function normalizeSkill(skill: string): string {
  const normalizations: Record<string, string> = {
    'reactjs': 'React',
    'react.js': 'React',
    'vuejs': 'Vue',
    'vue.js': 'Vue',
    'angularjs': 'Angular',
    'nodejs': 'Node.js',
    'node': 'Node.js',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
  };

  const lower = skill.toLowerCase().trim();
  return normalizations[lower] || skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

/**
 * Extract experience level from job description
 */
export function extractExperienceLevel(jobDescription: string): string {
  const text = jobDescription.toLowerCase();

  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
    return 'Senior';
  } else if (text.includes('mid-level') || text.includes('intermediate')) {
    return 'Mid';
  } else if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
    return 'Junior';
  }

  // Check for years of experience
  const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years >= 6) return 'Senior';
    if (years >= 3) return 'Mid';
    return 'Junior';
  }

  return 'Mid'; // Default
}

/**
 * Validate resume data completeness
 */
export function validateResumeData(data: Partial<ParsedResumeData>): string[] {
  const errors: string[] = [];

  if (!data.skills || data.skills.length === 0) {
    errors.push('Skills section is required');
  }

  if (!data.workExperience || data.workExperience.length === 0) {
    errors.push('Work experience is required');
  }

  if (!data.education || data.education.length === 0) {
    errors.push('Education information is required');
  }

  return errors;
}

/**
 * Format resume data for display
 */
export function formatResumeForDisplay(data: ParsedResumeData): string {
  let formatted = '';

  // Personal Info
  if (data.parsedSections.personalInfo) {
    const info = data.parsedSections.personalInfo;
    formatted += `${info.name || 'Your Name'}\n`;
    if (info.email) formatted += `Email: ${info.email}\n`;
    if (info.phone) formatted += `Phone: ${info.phone}\n`;
    if (info.location) formatted += `Location: ${info.location}\n`;
    if (info.linkedin) formatted += `LinkedIn: ${info.linkedin}\n`;
    formatted += '\n';
  }

  // Summary
  if (data.parsedSections.summary) {
    formatted += `PROFESSIONAL SUMMARY\n${data.parsedSections.summary}\n\n`;
  }

  // Skills
  if (data.parsedSections.skills.length > 0) {
    formatted += `SKILLS\n${data.parsedSections.skills.join(', ')}\n\n`;
  }

  // Work Experience
  if (data.parsedSections.workExperience.length > 0) {
    formatted += `WORK EXPERIENCE\n`;
    data.parsedSections.workExperience.forEach(exp => {
      formatted += `\n${exp.title} at ${exp.company}\n`;
      formatted += `${exp.duration}\n`;
      if (exp.description) formatted += `${exp.description}\n`;
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          formatted += `• ${achievement}\n`;
        });
      }
    });
    formatted += '\n';
  }

  // Projects
  if (data.parsedSections.projects.length > 0) {
    formatted += `PROJECTS\n`;
    data.parsedSections.projects.forEach(project => {
      formatted += `\n${project.name}\n`;
      formatted += `${project.description}\n`;
      if (project.technologies && project.technologies.length > 0) {
        formatted += `Technologies: ${project.technologies.join(', ')}\n`;
      }
    });
    formatted += '\n';
  }

  // Education
  if (data.parsedSections.education.length > 0) {
    formatted += `EDUCATION\n`;
    data.parsedSections.education.forEach(edu => {
      formatted += `\n${edu.degree} in ${edu.field || 'N/A'}\n`;
      formatted += `${edu.institution}${edu.year ? ` - ${edu.year}` : ''}\n`;
    });
    formatted += '\n';
  }

  // Certifications
  if (data.parsedSections.certifications.length > 0) {
    formatted += `CERTIFICATIONS\n${data.parsedSections.certifications.join('\n')}\n`;
  }

  return formatted;
}

export default {
  generateResume,
  analyzeJobDescription,
  parseResumeFile,
  generateApplicationEmail,
  extractJobKeywords,
  extractExperienceLevel,
  validateResumeData,
  formatResumeForDisplay,
};
