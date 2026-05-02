/**
 * ATS Debugger Utility
 * 
 * Provides debugging tools for ATS scoring system
 * Helps identify why scores might be 0% or incorrect
 */

import type { ATSScoreResult } from '../../types/resume.types';
import type { ParsedResumeData, JobDescriptionAnalysis } from '../../types/resume.types';
import type { CandidateResume, JobRole, ATSAnalysisResponse } from '../../services/atsService';

export interface ATSDebugInfo {
  timestamp: string;
  resumeData: {
    hasData: boolean;
    skillsCount: number;
    skills: string[];
    experienceCount: number;
    projectsCount: number;
    educationCount: number;
  };
  jobData: {
    hasJobDescription: boolean;
    hasJobAnalysis: boolean;
    requiredSkillsCount: number;
    requiredSkills: string[];
    preferredSkillsCount: number;
    keywordsCount: number;
  };
  atsRequest: {
    resumePayload: CandidateResume;
    jobsPayload: JobRole[];
  };
  atsResponse: {
    hasResponse: boolean;
    matchScore: number;
    detectedSkillsCount: number;
    detectedSkills: string[];
    matchingSkillsCount: number;
    matchingSkills: string[];
    missingSkillsCount: number;
    missingSkills: string[];
    experienceLevel: string;
    confidence: number;
  };
  issues: string[];
  suggestions: string[];
}

/**
 * Debug ATS scoring process
 */
export function debugATSScoring(
  parsedData: ParsedResumeData | undefined,
  jobDescription: string,
  jobAnalysis: JobDescriptionAnalysis | undefined,
  atsScore: ATSScoreResult | undefined,
  atsRequest?: { resume: CandidateResume; jobs: JobRole[] },
  atsResponse?: ATSAnalysisResponse
): ATSDebugInfo {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check resume data
  const resumeData = {
    hasData: !!parsedData,
    skillsCount: parsedData?.parsedSections.skills.length || 0,
    skills: parsedData?.parsedSections.skills || [],
    experienceCount: parsedData?.parsedSections.workExperience.length || 0,
    projectsCount: parsedData?.parsedSections.projects.length || 0,
    educationCount: parsedData?.parsedSections.education.length || 0,
  };

  if (!resumeData.hasData) {
    issues.push('❌ No resume data found');
    suggestions.push('Upload a resume file (PDF, DOCX, or TXT)');
  } else if (resumeData.skillsCount === 0) {
    issues.push('⚠️ No skills detected in resume');
    suggestions.push('Ensure your resume contains a skills section with clear skill names');
  }

  // Check job data
  const jobData = {
    hasJobDescription: !!jobDescription && jobDescription.trim().length > 0,
    hasJobAnalysis: !!jobAnalysis,
    requiredSkillsCount: jobAnalysis?.requiredSkills.length || 0,
    requiredSkills: jobAnalysis?.requiredSkills || [],
    preferredSkillsCount: jobAnalysis?.preferredSkills?.length || 0,
    keywordsCount: jobAnalysis?.extractedKeywords.length || 0,
  };

  if (!jobData.hasJobDescription) {
    issues.push('❌ No job description provided');
    suggestions.push('Add a job description to analyze against');
  } else if (!jobData.hasJobAnalysis) {
    issues.push('⚠️ Job description not analyzed');
    suggestions.push('Click "Analyze Job Description" button before running ATS analysis');
  } else if (jobData.requiredSkillsCount === 0) {
    issues.push('⚠️ No required skills extracted from job description');
    suggestions.push('Ensure job description contains clear skill requirements');
  }

  // Check ATS request payload
  const atsRequestData = {
    resumePayload: atsRequest?.resume || {} as CandidateResume,
    jobsPayload: atsRequest?.jobs || [],
  };

  if (atsRequest) {
    if (!atsRequest.resume.skills || atsRequest.resume.skills.length === 0) {
      issues.push('⚠️ ATS request has no skills in resume payload');
      suggestions.push('Resume parsing may have failed - check resume format');
    }
    if (!atsRequest.jobs || atsRequest.jobs.length === 0) {
      issues.push('⚠️ ATS request has no job roles');
      suggestions.push('Job analysis may have failed - check job description');
    }
  }

  // Check ATS response
  const atsResponseData = {
    hasResponse: !!atsScore,
    matchScore: atsScore?.job_matches[0]?.match_score || 0,
    detectedSkillsCount: atsScore?.detected_skills.length || 0,
    detectedSkills: atsScore?.detected_skills || [],
    matchingSkillsCount: atsScore?.job_matches[0]?.matching_skills.length || 0,
    matchingSkills: atsScore?.job_matches[0]?.matching_skills || [],
    missingSkillsCount: atsScore?.job_matches[0]?.missing_skills.length || 0,
    missingSkills: atsScore?.job_matches[0]?.missing_skills || [],
    experienceLevel: atsScore?.experience_level || 'Unknown',
    confidence: atsScore?.confidence_score || 0,
  };

  if (!atsResponseData.hasResponse) {
    issues.push('❌ No ATS score available');
    suggestions.push('Click "Run ATS Analysis" button to generate score');
  } else {
    if (atsResponseData.matchScore === 0) {
      issues.push('🔴 Match score is 0%');
      
      if (atsResponseData.detectedSkillsCount === 0) {
        issues.push('⚠️ No skills detected by ATS engine');
        suggestions.push('Resume may not be properly formatted or skills section is missing');
      }
      
      if (atsResponseData.matchingSkillsCount === 0) {
        issues.push('⚠️ No matching skills found between resume and job');
        suggestions.push('Add skills from the job description to your resume');
        suggestions.push('Use exact skill names from the job posting (e.g., "React" not "React.js")');
      }
    } else if (atsResponseData.matchScore < 50) {
      issues.push('⚠️ Low match score (< 50%)');
      suggestions.push(`Add missing skills: ${atsResponseData.missingSkills.slice(0, 5).join(', ')}`);
    }
  }

  // Skill overlap analysis
  if (resumeData.skills.length > 0 && jobData.requiredSkills.length > 0) {
    const overlap = resumeData.skills.filter(skill => 
      jobData.requiredSkills.some(reqSkill => 
        skill.toLowerCase() === reqSkill.toLowerCase()
      )
    );
    
    if (overlap.length === 0) {
      issues.push('⚠️ No direct skill overlap detected');
      suggestions.push('Resume skills: ' + resumeData.skills.slice(0, 5).join(', '));
      suggestions.push('Required skills: ' + jobData.requiredSkills.slice(0, 5).join(', '));
      suggestions.push('Ensure skill names match exactly (case-insensitive)');
    }
  }

  return {
    timestamp: new Date().toISOString(),
    resumeData,
    jobData,
    atsRequest: atsRequestData,
    atsResponse: atsResponseData,
    issues,
    suggestions,
  };
}

/**
 * Log debug info to console
 */
export function logATSDebugInfo(debugInfo: ATSDebugInfo): void {
  console.group('🔍 ATS Scoring Debug Info');
  console.log('Timestamp:', debugInfo.timestamp);
  
  console.group('📄 Resume Data');
  console.log('Has Data:', debugInfo.resumeData.hasData);
  console.log('Skills Count:', debugInfo.resumeData.skillsCount);
  console.log('Skills:', debugInfo.resumeData.skills);
  console.log('Experience Count:', debugInfo.resumeData.experienceCount);
  console.log('Projects Count:', debugInfo.resumeData.projectsCount);
  console.groupEnd();
  
  console.group('💼 Job Data');
  console.log('Has Job Description:', debugInfo.jobData.hasJobDescription);
  console.log('Has Job Analysis:', debugInfo.jobData.hasJobAnalysis);
  console.log('Required Skills Count:', debugInfo.jobData.requiredSkillsCount);
  console.log('Required Skills:', debugInfo.jobData.requiredSkills);
  console.groupEnd();
  
  console.group('📊 ATS Response');
  console.log('Has Response:', debugInfo.atsResponse.hasResponse);
  console.log('Match Score:', debugInfo.atsResponse.matchScore + '%');
  console.log('Detected Skills:', debugInfo.atsResponse.detectedSkills);
  console.log('Matching Skills:', debugInfo.atsResponse.matchingSkills);
  console.log('Missing Skills:', debugInfo.atsResponse.missingSkills);
  console.log('Experience Level:', debugInfo.atsResponse.experienceLevel);
  console.log('Confidence:', debugInfo.atsResponse.confidence);
  console.groupEnd();
  
  if (debugInfo.issues.length > 0) {
    console.group('⚠️ Issues Found');
    debugInfo.issues.forEach(issue => console.warn(issue));
    console.groupEnd();
  }
  
  if (debugInfo.suggestions.length > 0) {
    console.group('💡 Suggestions');
    debugInfo.suggestions.forEach(suggestion => console.info(suggestion));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Format debug info as readable text
 */
export function formatATSDebugInfo(debugInfo: ATSDebugInfo): string {
  let output = '🔍 ATS SCORING DEBUG REPORT\n';
  output += '='.repeat(50) + '\n\n';
  
  output += `Timestamp: ${new Date(debugInfo.timestamp).toLocaleString()}\n\n`;
  
  output += '📄 RESUME DATA\n';
  output += `-`.repeat(50) + '\n';
  output += `Has Data: ${debugInfo.resumeData.hasData ? '✓' : '✗'}\n`;
  output += `Skills Count: ${debugInfo.resumeData.skillsCount}\n`;
  output += `Skills: ${debugInfo.resumeData.skills.join(', ') || 'None'}\n`;
  output += `Experience: ${debugInfo.resumeData.experienceCount} entries\n`;
  output += `Projects: ${debugInfo.resumeData.projectsCount} entries\n\n`;
  
  output += '💼 JOB DATA\n';
  output += `-`.repeat(50) + '\n';
  output += `Has Job Description: ${debugInfo.jobData.hasJobDescription ? '✓' : '✗'}\n`;
  output += `Has Job Analysis: ${debugInfo.jobData.hasJobAnalysis ? '✓' : '✗'}\n`;
  output += `Required Skills Count: ${debugInfo.jobData.requiredSkillsCount}\n`;
  output += `Required Skills: ${debugInfo.jobData.requiredSkills.join(', ') || 'None'}\n\n`;
  
  output += '📊 ATS RESPONSE\n';
  output += `-`.repeat(50) + '\n';
  output += `Has Response: ${debugInfo.atsResponse.hasResponse ? '✓' : '✗'}\n`;
  output += `Match Score: ${debugInfo.atsResponse.matchScore}%\n`;
  output += `Detected Skills: ${debugInfo.atsResponse.detectedSkills.join(', ') || 'None'}\n`;
  output += `Matching Skills: ${debugInfo.atsResponse.matchingSkills.join(', ') || 'None'}\n`;
  output += `Missing Skills: ${debugInfo.atsResponse.missingSkills.join(', ') || 'None'}\n`;
  output += `Experience Level: ${debugInfo.atsResponse.experienceLevel}\n`;
  output += `Confidence: ${(debugInfo.atsResponse.confidence * 100).toFixed(0)}%\n\n`;
  
  if (debugInfo.issues.length > 0) {
    output += '⚠️ ISSUES FOUND\n';
    output += `-`.repeat(50) + '\n';
    debugInfo.issues.forEach(issue => {
      output += `${issue}\n`;
    });
    output += '\n';
  }
  
  if (debugInfo.suggestions.length > 0) {
    output += '💡 SUGGESTIONS\n';
    output += `-`.repeat(50) + '\n';
    debugInfo.suggestions.forEach(suggestion => {
      output += `• ${suggestion}\n`;
    });
    output += '\n';
  }
  
  output += '='.repeat(50) + '\n';
  
  return output;
}

export default {
  debugATSScoring,
  logATSDebugInfo,
  formatATSDebugInfo,
};
