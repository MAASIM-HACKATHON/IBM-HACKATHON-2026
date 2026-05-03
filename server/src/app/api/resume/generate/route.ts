import { NextRequest, NextResponse } from 'next/server';
import type { CandidateResume } from '@/types/ats.types';

interface ResumeGenerationRequest {
  profileData: CandidateResume;
  jobDescription: string;
  resumeType: 'ats-optimized' | 'full-cv';
  targetRole?: string;
  additionalInstructions?: string;
}

interface ResumeGenerationResponse {
  generatedResume: string;
  format: 'markdown' | 'html' | 'plain';
  suggestions: string[];
  weakSections: string[];
  timestamp: string;
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
    const body: ResumeGenerationRequest = await request.json();
    const { profileData, jobDescription, resumeType, targetRole, additionalInstructions } = body;

    // Validate input
    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate resume based on type
    const generatedResume = generateResumeContent(
      profileData,
      jobDescription,
      resumeType,
      targetRole,
      additionalInstructions
    );

    // Generate suggestions
    const suggestions = generateSuggestions(profileData, jobDescription, resumeType);

    // Identify weak sections
    const weakSections = identifyWeakSections(profileData);

    const response: ResumeGenerationResponse = {
      generatedResume,
      format: 'plain',
      suggestions,
      weakSections,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function generateResumeContent(
  profileData: CandidateResume,
  jobDescription: string,
  resumeType: 'ats-optimized' | 'full-cv',
  targetRole?: string,
  additionalInstructions?: string
): string {
  let resume = '';

  // Extract job keywords for optimization
  const jobKeywords = extractKeywords(jobDescription);

  // Header section (minimal for ATS)
  resume += '═'.repeat(70) + '\n';
  resume += 'PROFESSIONAL RESUME\n';
  if (targetRole) {
    resume += `Target Role: ${targetRole}\n`;
  }
  resume += '═'.repeat(70) + '\n\n';

  // Professional Summary (optimized with job keywords)
  if (resumeType === 'full-cv' || profileData.rawText) {
    resume += 'PROFESSIONAL SUMMARY\n';
    resume += '─'.repeat(70) + '\n';
    resume += generateOptimizedSummary(profileData, jobKeywords, resumeType);
    resume += '\n\n';
  }

  // Core Skills (prioritize job-relevant skills)
  if (profileData.skills && profileData.skills.length > 0) {
    resume += 'CORE COMPETENCIES & TECHNICAL SKILLS\n';
    resume += '─'.repeat(70) + '\n';
    const optimizedSkills = prioritizeSkills(profileData.skills, jobKeywords);
    
    // Format skills in rows for better readability
    const skillsPerRow = 4;
    for (let i = 0; i < optimizedSkills.length; i += skillsPerRow) {
      const skillGroup = optimizedSkills.slice(i, i + skillsPerRow);
      resume += skillGroup.join(' • ') + '\n';
    }
    resume += '\n';
  }

  // Professional Experience (PRESERVE ALL CONTENT)
  if (profileData.workExperience && profileData.workExperience.length > 0) {
    resume += 'PROFESSIONAL EXPERIENCE\n';
    resume += '─'.repeat(70) + '\n\n';
    
    profileData.workExperience.forEach((exp, index) => {
      resume += `${exp.title}\n`;
      resume += `${exp.company}`;
      if (exp.duration) resume += ` | ${exp.duration}`;
      if (exp.yearsOfExperience) resume += ` (${exp.yearsOfExperience} years)`;
      resume += '\n';
      resume += '·'.repeat(70) + '\n';
      
      // Include full description
      if (exp.description) {
        resume += `${exp.description}\n\n`;
      }
      
      // Add ALL achievements with bullet points
      if (exp.skills && exp.skills.length > 0) {
        resume += 'Key Technologies & Achievements:\n';
        exp.skills.forEach(skill => {
          resume += `  • ${skill}\n`;
        });
        resume += '\n';
      }
      
      if (index < profileData.workExperience!.length - 1) {
        resume += '\n';
      }
    });
    resume += '\n';
  }

  // Projects (ALWAYS include for comprehensive resume)
  if (profileData.projects && profileData.projects.length > 0) {
    resume += 'KEY PROJECTS & PORTFOLIO\n';
    resume += '─'.repeat(70) + '\n\n';
    
    profileData.projects.forEach((project, index) => {
      resume += `${project.name}\n`;
      resume += '·'.repeat(70) + '\n';
      resume += `${project.description}\n`;
      
      if (project.role) {
        resume += `Role: ${project.role}\n`;
      }
      
      if (project.technologies && project.technologies.length > 0) {
        resume += `Technologies: ${project.technologies.join(', ')}\n`;
      }
      
      if (project.achievements && project.achievements.length > 0) {
        resume += '\nKey Achievements:\n';
        project.achievements.forEach(achievement => {
          resume += `  • ${achievement}\n`;
        });
      }
      
      if (project.link) {
        resume += `Link: ${project.link}\n`;
      }
      
      if (profileData.projects && index < profileData.projects.length - 1) {
        resume += '\n';
      }
    });
    resume += '\n';
  }

  // Education (PRESERVE ALL DETAILS)
  if (profileData.education && profileData.education.length > 0) {
    resume += 'EDUCATION\n';
    resume += '─'.repeat(70) + '\n';
    
    profileData.education.forEach(edu => {
      resume += `${edu.degree}`;
      if (edu.field) resume += ` in ${edu.field}`;
      resume += '\n';
      resume += `${edu.institution}`;
      if (edu.location) resume += `, ${edu.location}`;
      if (edu.year) resume += ` | ${edu.year}`;
      resume += '\n';
      
      if (edu.gpa) {
        resume += `GPA: ${edu.gpa}\n`;
      }
      
      if (edu.honors && edu.honors.length > 0) {
        resume += `Honors: ${edu.honors.join(', ')}\n`;
      }
      
      resume += '\n';
    });
  }

  // Certifications (PRESERVE ALL)
  if (profileData.certifications && profileData.certifications.length > 0) {
    resume += 'CERTIFICATIONS & PROFESSIONAL DEVELOPMENT\n';
    resume += '─'.repeat(70) + '\n';
    profileData.certifications.forEach(cert => {
      resume += `  • ${cert}\n`;
    });
    resume += '\n';
  }

  // Additional instructions
  if (additionalInstructions && resumeType === 'full-cv') {
    resume += 'ADDITIONAL INFORMATION\n';
    resume += '─'.repeat(70) + '\n';
    resume += additionalInstructions + '\n\n';
  }

  // Footer
  resume += '═'.repeat(70) + '\n';
  resume += `Generated by IBM Watsonx AI Resume Builder | ${new Date().toLocaleDateString()}\n`;
  resume += '═'.repeat(70) + '\n';

  return resume;
}

function extractKeywords(jobDescription: string): string[] {
  const keywords: string[] = [];
  const text = jobDescription.toLowerCase();

  // Common technical skills
  const skillPatterns = [
    /\b(react|vue|angular|javascript|typescript|node\.?js|python|java|c\+\+|c#|go|rust)\b/gi,
    /\b(html|css|sass|tailwind|bootstrap)\b/gi,
    /\b(express|django|flask|spring|laravel)\b/gi,
    /\b(mysql|postgresql|mongodb|redis)\b/gi,
    /\b(docker|kubernetes|aws|azure|gcp)\b/gi,
    /\b(git|ci\/cd|agile|scrum)\b/gi,
  ];

  skillPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.trim();
        if (!keywords.includes(normalized.toLowerCase())) {
          keywords.push(normalized.toLowerCase());
        }
      });
    }
  });

  return keywords;
}

function generateOptimizedSummary(
  profileData: CandidateResume,
  jobKeywords: string[],
  resumeType: 'ats-optimized' | 'full-cv'
): string {
  const experienceYears = calculateTotalExperience(profileData);
  const topSkills = profileData.skills?.slice(0, 5) || [];
  
  let summary = '';
  
  if (resumeType === 'ats-optimized') {
    summary = `Results-driven professional with ${experienceYears}+ years of experience in ${topSkills.slice(0, 3).join(', ')}. `;
    summary += `Proven track record of delivering high-quality solutions and driving business outcomes. `;
    summary += `Strong expertise in ${topSkills.join(', ')} with a focus on innovation and continuous improvement.`;
  } else {
    summary = `Accomplished professional with ${experienceYears}+ years of comprehensive experience across ${topSkills.join(', ')}. `;
    summary += `Demonstrated ability to lead complex projects, mentor teams, and deliver exceptional results. `;
    summary += `Passionate about leveraging technology to solve challenging problems and create value. `;
    summary += `Seeking opportunities to contribute expertise and drive organizational success.`;
  }
  
  return summary;
}

function calculateTotalExperience(profileData: CandidateResume): number {
  if (!profileData.workExperience || profileData.workExperience.length === 0) {
    return 0;
  }

  const totalYears = profileData.workExperience.reduce((sum, exp) => {
    return sum + (exp.yearsOfExperience || 0);
  }, 0);

  return Math.max(totalYears, 1);
}

function prioritizeSkills(skills: string[], jobKeywords: string[]): string[] {
  const prioritized: string[] = [];
  const remaining: string[] = [];

  skills.forEach(skill => {
    const isRelevant = jobKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword) || keyword.includes(skill.toLowerCase())
    );
    
    if (isRelevant) {
      prioritized.push(skill);
    } else {
      remaining.push(skill);
    }
  });

  return [...prioritized, ...remaining];
}

function generateSuggestions(
  profileData: CandidateResume,
  jobDescription: string,
  resumeType: 'ats-optimized' | 'full-cv'
): string[] {
  const suggestions: string[] = [];

  // Check for quantifiable achievements
  const hasQuantifiableAchievements = profileData.workExperience?.some(exp => 
    exp.description?.match(/\d+%|\$\d+|increased|decreased|improved/i)
  );
  
  if (!hasQuantifiableAchievements) {
    suggestions.push('Add quantifiable achievements (e.g., "Increased efficiency by 30%")');
  }

  // Check for action verbs
  const hasActionVerbs = profileData.workExperience?.some(exp =>
    exp.description?.match(/^(led|managed|developed|implemented|designed|created)/i)
  );
  
  if (!hasActionVerbs) {
    suggestions.push('Start bullet points with strong action verbs (Led, Managed, Developed)');
  }

  // Check for keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  const resumeText = JSON.stringify(profileData).toLowerCase();
  const missingKeywords = jobKeywords.filter(keyword => !resumeText.includes(keyword));
  
  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding relevant keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }

  // Resume type specific suggestions
  if (resumeType === 'ats-optimized') {
    suggestions.push('Keep formatting simple - avoid tables, columns, and graphics');
    suggestions.push('Use standard section headings (Experience, Education, Skills)');
  } else {
    suggestions.push('Consider adding a portfolio link or project showcase');
    suggestions.push('Include detailed project descriptions with outcomes');
  }

  return suggestions;
}

function identifyWeakSections(profileData: CandidateResume): string[] {
  const weakSections: string[] = [];

  if (!profileData.skills || profileData.skills.length < 5) {
    weakSections.push('Skills section needs more entries (aim for 8-12 relevant skills)');
  }

  if (!profileData.workExperience || profileData.workExperience.length === 0) {
    weakSections.push('Work experience section is missing or incomplete');
  }

  if (profileData.workExperience) {
    const hasDetailedDescriptions = profileData.workExperience.every(exp => 
      exp.description && exp.description.length > 50
    );
    
    if (!hasDetailedDescriptions) {
      weakSections.push('Work experience descriptions need more detail');
    }
  }

  if (!profileData.education || profileData.education.length === 0) {
    weakSections.push('Education section is missing');
  }

  return weakSections;
}
