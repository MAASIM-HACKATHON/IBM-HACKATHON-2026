/**
 * useResumeBuilder Hook
 * Manages state and logic for the Resume Builder feature
 */

import { useState, useCallback } from 'react';
import type {
  ResumeBuilderState,
  ResumeBuilderStep,
  UploadedFile,
  ParsedResumeData,
  JobDescriptionAnalysis,
  ResumeGenerationResponse,
  ATSScoreResult,
} from '../types/resume.types';
import type { ATSAnalysisResponse } from '../services/atsService';
import {
  parseResumeFile,
  analyzeJobDescription,
  generateResume,
  extractJobKeywords,
  extractExperienceLevel,
  extractSkillsFromRawText,
} from '../services/resumeService';
import { analyzeResume } from '../services/atsService';

interface UseResumeBuilderReturn extends ResumeBuilderState {
  // File Upload
  handleFileUpload: (file: File) => Promise<void>;
  clearFile: () => void;

  // Job Description
  setJobDescription: (description: string) => void;
  analyzeJD: () => Promise<void>;

  // Resume Generation
  generateATSResume: () => Promise<void>;
  generateFullCV: () => Promise<void>;

  // ATS Analysis
  runATSAnalysis: () => Promise<void>;

  // Navigation
  goToStep: (step: ResumeBuilderStep) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Reset
  reset: () => void;
}

const initialState: ResumeBuilderState = {
  currentStep: 'upload',
  jobDescription: '',
  loading: false,
  error: null,
};

export function useResumeBuilder(): UseResumeBuilderReturn {
  const [state, setState] = useState<ResumeBuilderState>(initialState);

  // File Upload Handler
  const handleFileUpload = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload PDF, DOCX, or TXT file.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit.');
      }

      const uploadedFile: UploadedFile = {
        file,
        type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : 'txt',
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      };

      // Parse the file
      const parsedData = await parseResumeFile(file);

      // Fallback: If no skills were parsed, try extracting from raw text
      if (parsedData.parsedSections.skills.length === 0 && parsedData.rawText) {
        const extractedSkills = extractSkillsFromRawText(parsedData.rawText);
        
        if (extractedSkills.length > 0) {
          parsedData.parsedSections.skills = extractedSkills;
          parsedData.skills = extractedSkills;
        }
      }

      setState(prev => ({
        ...prev,
        uploadedFile,
        parsedData,
        loading: false,
        currentStep: 'job-description',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      }));
    }
  }, []);

  // Clear uploaded file
  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFile: undefined,
      parsedData: undefined,
      currentStep: 'upload',
    }));
  }, []);

  // Set job description
  const setJobDescription = useCallback((description: string) => {
    setState(prev => ({ ...prev, jobDescription: description }));
  }, []);

  // Analyze Job Description
  const analyzeJD = useCallback(async () => {
    if (!state.jobDescription.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a job description' }));
      return;
    }

    // Check if job description is too short/vague
    if (state.jobDescription.trim().length < 20) {
      setState(prev => ({
        ...prev,
        error: 'Job description is too short. Please provide a detailed job description with required skills, responsibilities, and qualifications (at least 20 characters).'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try server-side analysis first
      let analysis: JobDescriptionAnalysis | null = null;
      
      try {
        analysis = await analyzeJobDescription(state.jobDescription);
      } catch (error) {
        // Silently fall back to client-side analysis
      }

      // If server analysis failed or returned empty results, use client-side analysis
      if (!analysis || !analysis.requiredSkills || analysis.requiredSkills.length === 0) {
        const keywords = extractJobKeywords(state.jobDescription);
        const experienceLevel = extractExperienceLevel(state.jobDescription);

        // If still no keywords found, show error
        if (keywords.length === 0) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Could not extract skills from job description. Please provide a more detailed job description with specific technical skills and requirements.'
          }));
          return;
        }

        const requiredSkills = keywords.slice(0, 10);
        const preferredSkills = keywords.length > 10 ? keywords.slice(10, 15) : [];
        const technologies = keywords.filter(k =>
          ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'MongoDB', 'PostgreSQL', 'MySQL'].includes(k)
        );

        analysis = {
          extractedKeywords: keywords,
          requiredSkills,
          preferredSkills,
          technologies,
          experienceLevel,
          responsibilities: [],
          qualifications: [],
        };
      }

      setState(prev => ({
        ...prev,
        jobAnalysis: analysis,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze job description',
      }));
    }
  }, [state.jobDescription]);

  // Generate ATS-Optimized Resume
  const generateATSResume = useCallback(async () => {
    if (!state.parsedData) {
      setState(prev => ({ ...prev, error: 'No resume data available' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await generateResume({
        profileData: state.parsedData,
        jobDescription: state.jobDescription,
        resumeType: 'ats-optimized',
      });

      setState(prev => ({
        ...prev,
        generatedResume: response,
        loading: false,
        currentStep: 'results',
      }));
    } catch (error) {
      // Fallback to basic formatting if API fails
      const fallbackResume: ResumeGenerationResponse = {
        generatedResume: generateFallbackResume(state.parsedData, 'ats-optimized'),
        format: 'plain',
        suggestions: [
          'Add quantifiable achievements to work experience',
          'Include relevant keywords from job description',
          'Keep formatting simple and ATS-friendly',
        ],
        weakSections: [],
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        generatedResume: fallbackResume,
        loading: false,
        currentStep: 'results',
      }));
    }
  }, [state.parsedData, state.jobDescription]);

  // Generate Full CV
  const generateFullCV = useCallback(async () => {
    if (!state.parsedData) {
      setState(prev => ({ ...prev, error: 'No resume data available' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await generateResume({
        profileData: state.parsedData,
        jobDescription: state.jobDescription,
        resumeType: 'full-cv',
      });

      setState(prev => ({
        ...prev,
        generatedResume: response,
        loading: false,
        currentStep: 'results',
      }));
    } catch (error) {
      // Fallback to basic formatting if API fails
      const fallbackCV: ResumeGenerationResponse = {
        generatedResume: generateFallbackResume(state.parsedData, 'full-cv'),
        format: 'plain',
        suggestions: [
          'Add more details to project descriptions',
          'Include all relevant certifications',
          'Expand on technical achievements',
        ],
        weakSections: [],
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        generatedResume: fallbackCV,
        loading: false,
        currentStep: 'results',
      }));
    }
  }, [state.parsedData, state.jobDescription]);

  // Run ATS Analysis
  const runATSAnalysis = useCallback(async () => {
    if (!state.parsedData) {
      setState(prev => ({ ...prev, error: 'No resume data available' }));
      return;
    }

    // Validate job analysis exists and has required skills
    if (!state.jobAnalysis) {
      setState(prev => ({
        ...prev,
        error: 'Please analyze the job description first by clicking "Analyze Job Description"'
      }));
      return;
    }

    if (!state.jobAnalysis.requiredSkills || state.jobAnalysis.requiredSkills.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'No required skills found in job description. Please provide a more detailed job description with specific technical skills.'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get jobs from job description analysis
      const jobs = [{
        job_title: 'Target Position',
        required_skills: state.jobAnalysis.requiredSkills,
        preferred_skills: state.jobAnalysis.preferredSkills || [],
        keywords: state.jobAnalysis.extractedKeywords,
      }];

      // Prepare resume payload
      const resumePayload = {
        skills: state.parsedData.parsedSections.skills,
        workExperience: state.parsedData.parsedSections.workExperience.map(exp => ({
          title: exp.title,
          company: exp.company,
          duration: exp.duration,
          yearsOfExperience: exp.yearsOfExperience,
          description: exp.description,
          skills: exp.skills,
        })),
        projects: state.parsedData.parsedSections.projects.map(proj => ({
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
          skills: proj.technologies,
        })),
        education: state.parsedData.parsedSections.education,
        certifications: state.parsedData.parsedSections.certifications,
      };

      const result: ATSAnalysisResponse = await analyzeResume(resumePayload, jobs);

      // Enhance with score breakdown
      const enhancedResult: ATSScoreResult = {
        ...result,
        scoreBreakdown: {
          keywordMatch: result.job_matches[0]?.match_score || 0,
          skillsMatch: Math.min(
            (result.detected_skills.length / Math.max(state.jobAnalysis?.requiredSkills.length || 10, 1)) * 100,
            100
          ),
          experienceMatch: result.experience_level === state.jobAnalysis?.experienceLevel ? 100 : 70,
          formatScore: 85, // Assume good format
        },
        improvementAreas: result.recommendations.map((rec, index) => ({
          section: 'General',
          issue: rec,
          suggestion: rec,
          priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
        })),
      };

      setState(prev => ({
        ...prev,
        atsScore: enhancedResult,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to run ATS analysis',
      }));
    }
  }, [state.parsedData, state.jobAnalysis, state.jobDescription]);

  // Navigation
  const goToStep = useCallback((step: ResumeBuilderStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    const steps: ResumeBuilderStep[] = ['upload', 'job-description', 'generate', 'results'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1 && currentIndex >= 0) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setState(prev => ({ ...prev, currentStep: nextStep }));
      }
    }
  }, [state.currentStep]);

  const previousStep = useCallback(() => {
    const steps: ResumeBuilderStep[] = ['upload', 'job-description', 'generate', 'results'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setState(prev => ({ ...prev, currentStep: prevStep }));
      }
    }
  }, [state.currentStep]);

  // Reset
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    handleFileUpload,
    clearFile,
    setJobDescription,
    analyzeJD,
    generateATSResume,
    generateFullCV,
    runATSAnalysis,
    goToStep,
    nextStep,
    previousStep,
    reset,
  };
}

// Helper function to generate fallback resume
function generateFallbackResume(data: ParsedResumeData, type: 'ats-optimized' | 'full-cv'): string {
  let resume = '';

  // Personal Info
  if (data.parsedSections.personalInfo) {
    const info = data.parsedSections.personalInfo;
    resume += `${info.name || 'YOUR NAME'}\n`;
    if (info.email) resume += `${info.email} | `;
    if (info.phone) resume += `${info.phone} | `;
    if (info.location) resume += `${info.location}`;
    resume += '\n';
    if (info.linkedin) resume += `LinkedIn: ${info.linkedin} | `;
    if (info.github) resume += `GitHub: ${info.github}`;
    resume += '\n\n';
  }

  // Summary (for full CV)
  if (type === 'full-cv' && data.parsedSections.summary) {
    resume += `PROFESSIONAL SUMMARY\n${data.parsedSections.summary}\n\n`;
  }

  // Skills
  resume += `SKILLS\n`;
  resume += data.parsedSections.skills.join(' • ') + '\n\n';

  // Work Experience
  resume += `WORK EXPERIENCE\n`;
  data.parsedSections.workExperience.forEach(exp => {
    resume += `\n${exp.title}\n`;
    resume += `${exp.company} | ${exp.duration}\n`;
    if (exp.description) resume += `${exp.description}\n`;
    if (exp.achievements && exp.achievements.length > 0) {
      exp.achievements.forEach(achievement => {
        resume += `• ${achievement}\n`;
      });
    }
  });
  resume += '\n';

  // Projects (for full CV or if significant)
  if (type === 'full-cv' || data.parsedSections.projects.length > 0) {
    resume += `PROJECTS\n`;
    data.parsedSections.projects.forEach(project => {
      resume += `\n${project.name}\n`;
      resume += `${project.description}\n`;
      if (project.technologies) {
        resume += `Technologies: ${project.technologies.join(', ')}\n`;
      }
    });
    resume += '\n';
  }

  // Education
  resume += `EDUCATION\n`;
  data.parsedSections.education.forEach(edu => {
    resume += `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}\n`;
    resume += `${edu.institution}${edu.year ? ` | ${edu.year}` : ''}\n`;
  });
  resume += '\n';

  // Certifications
  if (data.parsedSections.certifications.length > 0) {
    resume += `CERTIFICATIONS\n`;
    data.parsedSections.certifications.forEach(cert => {
      resume += `• ${cert}\n`;
    });
  }

  return resume;
}
