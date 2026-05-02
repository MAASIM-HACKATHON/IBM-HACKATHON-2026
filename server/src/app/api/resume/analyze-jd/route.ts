import { NextRequest, NextResponse } from 'next/server';

interface JobDescriptionAnalysis {
  extractedKeywords: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  experienceLevel: string;
  responsibilities: string[];
  qualifications: string[];
  companyInfo?: {
    name?: string;
    industry?: string;
    culture?: string;
  };
}

// CORS headers helper
function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { jobDescription } = await request.json();

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const analysis = analyzeJobDescription(jobDescription);

    return NextResponse.json(analysis, { headers: corsHeaders });
  } catch (error) {
    console.error('Job description analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function analyzeJobDescription(jobDescription: string): JobDescriptionAnalysis {
  const text = jobDescription.toLowerCase();
  const lines = jobDescription.split('\n').filter(line => line.trim());

  // Extract keywords
  const extractedKeywords = extractAllKeywords(jobDescription);

  // Categorize skills
  const { requiredSkills, preferredSkills } = categorizeSkills(jobDescription, extractedKeywords);

  // Extract technologies
  const technologies = extractTechnologies(jobDescription);

  // Determine experience level
  const experienceLevel = determineExperienceLevel(jobDescription);

  // Extract responsibilities
  const responsibilities = extractResponsibilities(lines);

  // Extract qualifications
  const qualifications = extractQualifications(lines);

  // Extract company info
  const companyInfo = extractCompanyInfo(jobDescription);

  return {
    extractedKeywords,
    requiredSkills,
    preferredSkills,
    technologies,
    experienceLevel,
    responsibilities,
    qualifications,
    companyInfo,
  };
}

function extractAllKeywords(text: string): string[] {
  const keywords = new Set<string>();

  // Technical skills patterns
  const skillPatterns = [
    // Programming languages
    /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin|scala)\b/gi,
    // Frontend
    /\b(react|vue|angular|svelte|next\.?js|nuxt|gatsby|html|css|sass|less|tailwind|bootstrap)\b/gi,
    // Backend
    /\b(node\.?js|express|django|flask|spring|laravel|rails|asp\.net|fastapi)\b/gi,
    // Databases
    /\b(mysql|postgresql|mongodb|redis|elasticsearch|cassandra|dynamodb|oracle|sql server)\b/gi,
    // Cloud & DevOps
    /\b(aws|azure|gcp|google cloud|docker|kubernetes|jenkins|gitlab|github actions|terraform|ansible)\b/gi,
    // Tools & Methodologies
    /\b(git|jira|confluence|agile|scrum|kanban|ci\/cd|rest|graphql|api|microservices)\b/gi,
    // AI/ML
    /\b(machine learning|deep learning|tensorflow|pytorch|scikit-learn|nlp|computer vision)\b/gi,
  ];

  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        keywords.add(normalizeSkill(match));
      });
    }
  });

  // Soft skills
  const softSkillPatterns = [
    /\b(leadership|communication|teamwork|problem[- ]solving|analytical|creative|innovative)\b/gi,
    /\b(collaboration|mentoring|coaching|presentation|negotiation|time management)\b/gi,
  ];

  softSkillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        keywords.add(match.trim().toLowerCase());
      });
    }
  });

  return Array.from(keywords);
}

function categorizeSkills(text: string, allKeywords: string[]): {
  requiredSkills: string[];
  preferredSkills: string[];
} {
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];

  const lines = text.toLowerCase().split('\n');

  let inRequiredSection = false;
  let inPreferredSection = false;

  lines.forEach(line => {
    // Detect section headers
    if (line.includes('required') || line.includes('must have') || line.includes('qualifications')) {
      inRequiredSection = true;
      inPreferredSection = false;
    } else if (line.includes('preferred') || line.includes('nice to have') || line.includes('bonus')) {
      inRequiredSection = false;
      inPreferredSection = true;
    } else if (line.includes('responsibilities') || line.includes('about')) {
      inRequiredSection = false;
      inPreferredSection = false;
    }

    // Extract skills from current line
    allKeywords.forEach(keyword => {
      if (line.includes(keyword.toLowerCase())) {
        if (inRequiredSection && !requiredSkills.includes(keyword)) {
          requiredSkills.push(keyword);
        } else if (inPreferredSection && !preferredSkills.includes(keyword)) {
          preferredSkills.push(keyword);
        }
      }
    });
  });

  // If no clear categorization, put most common skills in required
  if (requiredSkills.length === 0 && preferredSkills.length === 0) {
    const topSkills = allKeywords.slice(0, 10);
    requiredSkills.push(...topSkills.slice(0, 6));
    preferredSkills.push(...topSkills.slice(6));
  }

  return { requiredSkills, preferredSkills };
}

function extractTechnologies(text: string): string[] {
  const technologies = new Set<string>();

  const techPatterns = [
    /\b(react|vue|angular|node\.?js|python|java|javascript|typescript)\b/gi,
    /\b(aws|azure|gcp|docker|kubernetes)\b/gi,
    /\b(mysql|postgresql|mongodb|redis)\b/gi,
  ];

  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        technologies.add(normalizeSkill(match));
      });
    }
  });

  return Array.from(technologies);
}

function determineExperienceLevel(text: string): string {
  const lowerText = text.toLowerCase();

  // Check for explicit level mentions
  if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal') || lowerText.includes('staff')) {
    return 'Senior';
  }
  
  if (lowerText.includes('mid-level') || lowerText.includes('intermediate')) {
    return 'Mid';
  }
  
  if (lowerText.includes('junior') || lowerText.includes('entry') || lowerText.includes('graduate') || lowerText.includes('associate')) {
    return 'Junior';
  }

  // Check for years of experience
  const yearsMatch = lowerText.match(/(\d+)\+?\s*(?:to\s+(\d+))?\s*years?/i);
  if (yearsMatch) {
    const minYears = parseInt(yearsMatch[1]);
    const maxYears = yearsMatch[2] ? parseInt(yearsMatch[2]) : minYears;
    
    if (minYears >= 6 || maxYears >= 6) return 'Senior';
    if (minYears >= 3 || maxYears >= 3) return 'Mid';
    return 'Junior';
  }

  return 'Mid'; // Default
}

function extractResponsibilities(lines: string[]): string[] {
  const responsibilities: string[] = [];
  let inResponsibilitiesSection = false;

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Detect responsibilities section
    if (lowerLine.includes('responsibilities') || lowerLine.includes('what you\'ll do') || lowerLine.includes('role')) {
      inResponsibilitiesSection = true;
      return;
    }
    
    // Exit section
    if (lowerLine.includes('qualifications') || lowerLine.includes('requirements') || lowerLine.includes('skills')) {
      inResponsibilitiesSection = false;
      return;
    }

    // Extract responsibility items
    if (inResponsibilitiesSection && line.trim()) {
      const cleaned = line.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        responsibilities.push(cleaned);
      }
    }
  });

  return responsibilities.slice(0, 8); // Limit to top 8
}

function extractQualifications(lines: string[]): string[] {
  const qualifications: string[] = [];
  let inQualificationsSection = false;

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Detect qualifications section
    if (lowerLine.includes('qualifications') || lowerLine.includes('requirements') || lowerLine.includes('must have')) {
      inQualificationsSection = true;
      return;
    }
    
    // Exit section
    if (lowerLine.includes('responsibilities') || lowerLine.includes('about') || lowerLine.includes('benefits')) {
      inQualificationsSection = false;
      return;
    }

    // Extract qualification items
    if (inQualificationsSection && line.trim()) {
      const cleaned = line.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        qualifications.push(cleaned);
      }
    }
  });

  return qualifications.slice(0, 8); // Limit to top 8
}

function extractCompanyInfo(text: string): {
  name?: string;
  industry?: string;
  culture?: string;
} {
  const companyInfo: {
    name?: string;
    industry?: string;
    culture?: string;
  } = {};

  // Try to extract company name (usually in first few lines)
  const lines = text.split('\n');
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.toLowerCase().includes('job') && !firstLine.toLowerCase().includes('position')) {
      companyInfo.name = firstLine;
    }
  }

  // Detect industry keywords
  const industryKeywords = {
    'fintech': ['fintech', 'financial', 'banking', 'payment'],
    'healthcare': ['healthcare', 'medical', 'health', 'hospital'],
    'e-commerce': ['e-commerce', 'ecommerce', 'retail', 'shopping'],
    'saas': ['saas', 'software as a service', 'cloud platform'],
    'ai/ml': ['artificial intelligence', 'machine learning', 'ai', 'ml'],
  };

  const lowerText = text.toLowerCase();
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      companyInfo.industry = industry;
      break;
    }
  }

  // Extract culture hints
  const cultureKeywords = ['innovative', 'collaborative', 'fast-paced', 'startup', 'enterprise', 'remote', 'hybrid'];
  const foundCultureWords = cultureKeywords.filter(keyword => lowerText.includes(keyword));
  if (foundCultureWords.length > 0) {
    companyInfo.culture = foundCultureWords.join(', ');
  }

  return companyInfo;
}

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
