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
 * Enhanced to handle vague job descriptions
 */
export function extractJobKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const keywords: string[] = [];

  // Common skill patterns
  const skillPatterns = [
    /\b(react|vue|angular|javascript|typescript|node\.?js|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin)\b/gi,
    /\b(html|css|sass|less|tailwind|bootstrap|material-?ui|chakra)\b/gi,
    /\b(express|django|flask|spring|laravel|rails|fastapi|nest\.?js)\b/gi,
    /\b(mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra|oracle)\b/gi,
    /\b(docker|kubernetes|aws|azure|gcp|google cloud|heroku|vercel|netlify)\b/gi,
    /\b(git|ci\/cd|jenkins|github actions|gitlab|bitbucket|travis)\b/gi,
    /\b(rest|restful|graphql|api|microservices|soap)\b/gi,
    /\b(agile|scrum|kanban|jira|confluence|trello)\b/gi,
    /\b(next\.?js|nuxt\.?js|gatsby|remix|svelte|solid)\b/gi,
    /\b(webpack|vite|rollup|parcel|babel|esbuild)\b/gi,
    /\b(jest|mocha|chai|cypress|playwright|selenium|testing library)\b/gi,
    /\b(redux|mobx|zustand|recoil|context api|vuex|pinia)\b/gi,
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

  // If no specific skills found, add generic skills based on job type
  if (keywords.length === 0) {
    // Check for job role keywords
    if (/\b(developer|engineer|programmer|coder)\b/i.test(text)) {
      // Add common developer skills
      keywords.push('JavaScript', 'HTML', 'CSS', 'Git');
      
      if (/\b(frontend|front-end|front end|ui|user interface)\b/i.test(text)) {
        keywords.push('React', 'TypeScript', 'Responsive Design');
      } else if (/\b(backend|back-end|back end|server|api)\b/i.test(text)) {
        keywords.push('Node.js', 'API Development', 'Database');
      } else if (/\b(full-?stack|fullstack)\b/i.test(text)) {
        keywords.push('React', 'Node.js', 'MongoDB', 'API Development');
      } else {
        // Generic developer role
        keywords.push('Programming', 'Problem Solving', 'Software Development');
      }
    }
    
    // Add experience level as a "skill"
    if (/\b(junior|entry|graduate)\b/i.test(text)) {
      keywords.push('Learning Ability', 'Team Collaboration');
    } else if (/\b(senior|lead|principal)\b/i.test(text)) {
      keywords.push('Leadership', 'Architecture', 'Mentoring');
    }
  }

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
 * Extract skills from raw resume text (fallback when parsing fails)
 */
export function extractSkillsFromRawText(text: string): string[] {
  const skills: string[] = [];
  const lowerText = text.toLowerCase();

  // Comprehensive skill list
  const commonSkills = [
    // Frontend
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
    'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind',
    'Material-UI', 'Sass', 'Less', 'Webpack', 'Vite', 'Redux', 'MobX',
    
    // Backend
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring', 'Spring Boot', 'PHP', 'Laravel', 'Ruby', 'Rails',
    'Go', 'Rust', 'C++', 'C#', '.NET', 'ASP.NET',
    
    // Database
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'DynamoDB', 'Cassandra', 'Oracle', 'SQL Server', 'SQLite',
    
    // DevOps & Cloud
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'GCP',
    'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab', 'Terraform',
    'Ansible', 'Heroku', 'Vercel', 'Netlify',
    
    // Tools & Others
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'REST', 'RESTful', 'GraphQL', 'API', 'Microservices',
    'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD',
    
    // Testing
    'Jest', 'Mocha', 'Chai', 'Cypress', 'Playwright', 'Selenium',
    'Testing Library', 'JUnit', 'PyTest',
    
    // Mobile
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
    
    // AI/ML
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Scikit-learn', 'Pandas', 'NumPy', 'NLP', 'Computer Vision',
    
    // Other
    'Linux', 'Unix', 'Bash', 'Shell Scripting', 'PowerShell',
    'Nginx', 'Apache', 'Tomcat', 'WebSockets', 'Socket.io',
  ];

  // Check for each skill in the text
  commonSkills.forEach(skill => {
    // Create regex pattern that matches the skill as a whole word
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) {
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
  });

  // Also check for skills in common formats
  // e.g., "Skills: React, Node.js, MongoDB"
  const skillsSectionMatch = text.match(/(?:skills?|technologies?|technical skills?|core competencies)[:\s]+([^\n]+)/i);
  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1];
    const extractedSkills = skillsText.split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 0);
    extractedSkills.forEach(skill => {
      const normalized = normalizeSkill(skill);
      if (normalized && !skills.includes(normalized)) {
        skills.push(normalized);
      }
    });
  }

  return skills;
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
  extractSkillsFromRawText,
  validateResumeData,
  formatResumeForDisplay,
};
