/**
 * Shared ATS Type Definitions
 * 
 * These types can be imported by both backend and frontend
 */

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
