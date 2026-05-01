/**
 * ATS Service
 * 
 * Client-side service for interacting with the ATS API
 */

// Types (mirrored from server)
export interface CandidateResume {
  skills?: string[];
  workExperience?: WorkExperience[];
  projects?: Project[];
  education?: Education[];
  certifications?: string[];
  rawText?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  yearsOfExperience?: number;
  description?: string;
  skills?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  skills?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface JobRole {
  job_title: string;
  required_skills: string[];
  preferred_skills?: string[];
  keywords?: string[];
}

export interface JobMatch {
  job_title: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
}

export interface ATSResult {
  summary: string;
  detected_skills: string[];
  experience_level: 'Junior' | 'Mid' | 'Senior';
  possible_roles: string[];
  job_matches: JobMatch[];
  recommendations: string[];
  career_path_suggestion: string;
  confidence_score: number;
}

export interface ATSAnalysisRequest {
  resume: CandidateResume;
  jobs: JobRole[];
}

export interface ATSAnalysisResponse extends ATSResult {
  timestamp: string;
  processingTime?: number;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Analyze a candidate resume against job roles
 */
export async function analyzeResume(
  resume: CandidateResume,
  jobs: JobRole[]
): Promise<ATSAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ats/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resume,
      jobs,
    } as ATSAnalysisRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze resume');
  }

  return response.json();
}

/**
 * Parse resume text and extract structured data
 * This is a helper function for basic parsing
 */
export function parseResumeText(text: string): CandidateResume {
  return {
    rawText: text,
    skills: extractSkillsFromText(text),
  };
}

/**
 * Basic skill extraction from text
 */
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js',
    'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap',
    'Express', 'Django', 'Flask', 'Spring',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
  ];

  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

/**
 * Get sample job roles for testing
 */
export function getSampleJobs(): JobRole[] {
  return [
    {
      job_title: 'Frontend Developer',
      required_skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      preferred_skills: ['TypeScript', 'Next.js', 'Tailwind'],
      keywords: ['UI', 'responsive', 'web development'],
    },
    {
      job_title: 'Backend Developer',
      required_skills: ['Node.js', 'Express', 'MongoDB'],
      preferred_skills: ['TypeScript', 'PostgreSQL', 'Redis'],
      keywords: ['API', 'REST', 'database'],
    },
    {
      job_title: 'Full-Stack Developer',
      required_skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
      preferred_skills: ['TypeScript', 'AWS', 'Docker'],
      keywords: ['full-stack', 'MERN', 'web development'],
    },
    {
      job_title: 'DevOps Engineer',
      required_skills: ['Docker', 'Kubernetes', 'AWS'],
      preferred_skills: ['CI/CD', 'Jenkins', 'Terraform'],
      keywords: ['automation', 'infrastructure', 'cloud'],
    },
  ];
}

export default {
  analyzeResume,
  parseResumeText,
  getSampleJobs,
};
