/**
 * PDF Generator Utility
 * Generates professional formatted resume content for PDF export
 */

import type { ParsedResumeData } from '../../types/resume.types';

/**
 * Generate a well-formatted resume text suitable for PDF conversion
 */
export function generateFormattedResume(
  data: ParsedResumeData,
  type: 'ats-optimized' | 'full-cv'
): string {
  const { parsedSections } = data;
  let resume = '';

  // Header - Personal Info
  if (parsedSections.personalInfo) {
    const info = parsedSections.personalInfo;
    resume += `${info.name || 'YOUR NAME'}\n`;
    resume += '═'.repeat(60) + '\n\n';
    
    if (info.email) resume += `📧 Email: ${info.email}\n`;
    if (info.phone) resume += `📱 Phone: ${info.phone}\n`;
    if (info.location) resume += `📍 Location: ${info.location}\n`;
    if (info.linkedin) resume += `🔗 LinkedIn: ${info.linkedin}\n`;
    if (info.github) resume += `💻 GitHub: ${info.github}\n`;
    resume += '\n';
  }

  // Professional Summary (for Full CV)
  if (type === 'full-cv' && parsedSections.summary) {
    resume += '═'.repeat(60) + '\n';
    resume += 'PROFESSIONAL SUMMARY\n';
    resume += '═'.repeat(60) + '\n\n';
    resume += `${parsedSections.summary}\n\n`;
  }

  // Technical Skills
  if (parsedSections.skills.length > 0) {
    resume += '═'.repeat(60) + '\n';
    resume += 'TECHNICAL SKILLS\n';
    resume += '═'.repeat(60) + '\n\n';
    
    // Group skills in rows of 5
    const skillsPerRow = 5;
    for (let i = 0; i < parsedSections.skills.length; i += skillsPerRow) {
      const skillGroup = parsedSections.skills.slice(i, i + skillsPerRow);
      resume += skillGroup.join(' • ') + '\n';
    }
    resume += '\n';
  }

  // Professional Experience
  if (parsedSections.workExperience.length > 0) {
    resume += '═'.repeat(60) + '\n';
    resume += 'PROFESSIONAL EXPERIENCE\n';
    resume += '═'.repeat(60) + '\n\n';
    
    parsedSections.workExperience.forEach((exp, index) => {
      resume += `${exp.title}\n`;
      resume += `${exp.company} | ${exp.duration}\n`;
      resume += '─'.repeat(60) + '\n';
      
      if (exp.description) {
        resume += `${exp.description}\n\n`;
      }
      
      if (exp.achievements && exp.achievements.length > 0) {
        resume += 'Key Achievements:\n';
        exp.achievements.forEach(achievement => {
          resume += `  • ${achievement}\n`;
        });
      }
      
      if (exp.skills && exp.skills.length > 0) {
        resume += `\nTechnologies Used: ${exp.skills.join(', ')}\n`;
      }
      
      if (index < parsedSections.workExperience.length - 1) {
        resume += '\n';
      }
    });
    resume += '\n';
  }

  // Projects (for Full CV or if significant)
  if ((type === 'full-cv' || parsedSections.projects.length > 0) && parsedSections.projects.length > 0) {
    resume += '═'.repeat(60) + '\n';
    resume += 'PROJECTS\n';
    resume += '═'.repeat(60) + '\n\n';
    
    parsedSections.projects.forEach((project, index) => {
      resume += `${project.name}\n`;
      resume += '─'.repeat(60) + '\n';
      resume += `${project.description}\n`;
      
      if (project.technologies && project.technologies.length > 0) {
        resume += `\nTechnologies: ${project.technologies.join(', ')}\n`;
      }
      
      if (index < parsedSections.projects.length - 1) {
        resume += '\n';
      }
    });
    resume += '\n';
  }

  // Education
  if (parsedSections.education.length > 0) {
    resume += '═'.repeat(60) + '\n';
    resume += 'EDUCATION\n';
    resume += '═'.repeat(60) + '\n\n';
    
    parsedSections.education.forEach(edu => {
      resume += `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}\n`;
      resume += `${edu.institution}${edu.year ? ` | ${edu.year}` : ''}\n`;
      if (edu.gpa) resume += `GPA: ${edu.gpa}\n`;
      resume += '\n';
    });
  }

  // Certifications
  if (parsedSections.certifications.length > 0) {
    resume += '═'.repeat(60) + '\n';
    resume += 'CERTIFICATIONS\n';
    resume += '═'.repeat(60) + '\n\n';
    
    parsedSections.certifications.forEach(cert => {
      resume += `  • ${cert}\n`;
    });
    resume += '\n';
  }

  // Footer
  resume += '═'.repeat(60) + '\n';

  return resume;
}

/**
 * Download resume as a text file (can be easily converted to PDF)
 */
export function downloadResumeAsText(
  data: ParsedResumeData,
  type: 'ats-optimized' | 'full-cv'
): void {
  const content = generateFormattedResume(data, type);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type === 'ats-optimized' ? 'ATS_Optimized_Resume' : 'Full_CV'}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy resume content to clipboard
 */
export async function copyResumeToClipboard(
  data: ParsedResumeData,
  type: 'ats-optimized' | 'full-cv'
): Promise<void> {
  const content = generateFormattedResume(data, type);
  await navigator.clipboard.writeText(content);
}

// Made with Bob
