/**
 * Resume Parser Type Definitions
 * Shared types for AI-powered and rule-based resume parsing
 */

export interface ParsedResumeData {
  rawText: string;
  parsedSections: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    summary?: string;
    skills: string[];
    workExperience: Array<{
      title: string;
      company: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      duration: string;
      yearsOfExperience?: number;
      description?: string;
      achievements?: string[];
      skills?: string[];
    }>;
    projects: Array<{
      name: string;
      description: string;
      role?: string;
      duration?: string;
      technologies?: string[];
      skills?: string[];
      achievements?: string[];
      link?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location?: string;
      year?: string;
      field?: string;
      gpa?: string;
      honors?: string[];
    }>;
    certifications: string[];
  };
  metadata?: {
    parsingMethod: 'ai_hybrid' | 'rule_based_fallback';
    confidence: number;
    warnings: string[];
    processingTime?: number;
  };
  // Legacy compatibility fields
  skills?: string[];
  workExperience?: Array<any>;
  projects?: Array<any>;
  education?: Array<any>;
  certifications?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidenceScore: number;
}

export interface AIResumeOutput {
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  skills: string[];
  work_experience: Array<{
    company: string;
    title: string;
    duration: string;
    description?: string;
    years_of_experience?: number;
    location?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year?: string;
    field?: string;
  }>;
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
  }>;
}
