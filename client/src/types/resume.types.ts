/**
 * Resume Builder Types
 * Comprehensive type definitions for the AI Resume Builder & ATS Optimizer
 */

import type { CandidateResume, ATSResult } from '../services/atsService';

// Resume Generation Types
export interface ATSInsights {
  keywords: string[];
  gaps: string[];
  strengths: string[];
  score: number;
  prioritizedSkills: string[];
}

export interface ResumeGenerationRequest {
  profileData: CandidateResume;
  jobDescription: string;
  resumeType: 'ats-optimized' | 'full-cv';
  targetRole?: string;
  additionalInstructions?: string;
  atsInsights?: ATSInsights; // Optional - backend will compute if missing
}

export interface ResumeGenerationResponse {
  generatedResume: string;
  format: 'markdown' | 'html' | 'plain';
  suggestions: string[];
  weakSections: string[];
  timestamp: string;
  insights?: ATSInsights; // Returned from ATS generation
}

// Job Description Analysis Types
export interface JobDescriptionAnalysis {
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

// File Upload Types
export interface UploadedFile {
  file: File;
  type: 'pdf' | 'docx' | 'txt';
  name: string;
  size: number;
  uploadedAt: Date;
}

export interface ParsedResumeData extends CandidateResume {
  rawText: string;
  parsedSections: {
    personalInfo?: PersonalInfo;
    summary?: string;
    skills: string[];
    workExperience: WorkExperience[];
    projects: Project[];
    education: Education[];
    certifications: string[];
  };
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkExperience {
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
}

export interface Project {
  name: string;
  description: string;
  role?: string;
  duration?: string;
  technologies?: string[];
  skills?: string[];
  achievements?: string[];
  link?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  year?: string;
  field?: string;
  gpa?: string;
  honors?: string[];
}

// ATS Scoring Types
export interface ATSScoreResult extends ATSResult {
  scoreBreakdown: {
    keywordMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    formatScore: number;
  };
  improvementAreas: ImprovementArea[];
}

export interface ImprovementArea {
  section: string;
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

// UI State Types
export type ResumeBuilderStep = 
  | 'upload'
  | 'input-form'
  | 'job-description'
  | 'generate'
  | 'analyze'
  | 'results';

export interface ResumeBuilderState {
  currentStep: ResumeBuilderStep;
  uploadedFile?: UploadedFile;
  parsedData?: ParsedResumeData;
  jobDescription: string;
  jobAnalysis?: JobDescriptionAnalysis;
  generatedResume?: ResumeGenerationResponse; // Keep for backward compatibility
  atsResume?: ResumeGenerationResponse; // ATS-Optimized Resume
  fullCV?: ResumeGenerationResponse; // Full CV
  atsInsights?: ATSInsights; // ATS insights for CV generation
  atsScore?: ATSScoreResult;
  loading: boolean;
  error: string | null;
}

// Form Input Types
export interface ManualResumeInput {
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  projects: Project[];
  education: Education[];
  certifications: string[];
}

// Comparison Types
export interface ResumeComparison {
  original: string;
  optimized: string;
  changes: ResumeChange[];
  improvementScore: number;
}

export interface ResumeChange {
  section: string;
  type: 'added' | 'removed' | 'modified';
  before?: string;
  after?: string;
  reason: string;
}

// Email Generation Types (for application emails)
export interface ApplicationEmailRequest {
  resumeContent: string;
  jobDescription: string;
  tone: 'formal' | 'confident' | 'neutral' | 'enthusiastic';
  emailType: 'application' | 'follow-up' | 'thank-you';
  additionalContext?: string;
}

export interface ApplicationEmailResponse {
  subject: string;
  body: string;
  suggestions: string[];
}

// Export/Download Types
export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'html' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeFormatting: boolean;
  includeColors: boolean;
  template?: 'modern' | 'classic' | 'minimal' | 'professional';
}

// PDF Viewer Types
export interface PDFViewerState {
  pdfUrl: string | null;
  pdfFile: File | null;
  isGenerating: boolean;
  error: string | null;
}

export interface PDFGenerationOptions {
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface PDFMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
}
