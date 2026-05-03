/**
 * PDF Template Validator
 * Basic validation to ensure generated PDFs contain expected content
 */

interface ParsedResumeData {
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
    workExperience: Array<any>;
    projects: Array<any>;
    education: Array<any>;
    certifications: Array<any>;
  };
}

/**
 * Validate that HTML content contains expected resume data
 * This is a basic check to ensure the template rendered correctly
 */
export function validateHTMLContent(
  htmlContent: string,
  sourceData: ParsedResumeData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if HTML is not empty
  if (!htmlContent || htmlContent.trim().length === 0) {
    errors.push('Generated HTML is empty');
    return { valid: false, errors };
  }

  // Check for basic HTML structure
  if (!htmlContent.includes('<!DOCTYPE html>') || !htmlContent.includes('<html')) {
    errors.push('Invalid HTML structure');
  }

  // Check for personal info
  const personalInfo = sourceData.parsedSections.personalInfo;
  if (personalInfo) {
    if (personalInfo.name && !htmlContent.includes(personalInfo.name)) {
      errors.push(`Name "${personalInfo.name}" not found in generated HTML`);
    }
    if (personalInfo.email && !htmlContent.includes(personalInfo.email)) {
      errors.push(`Email "${personalInfo.email}" not found in generated HTML`);
    }
  }

  // Check for skills (at least some should be present)
  const skills = sourceData.parsedSections.skills;
  if (skills && skills.length > 0) {
    const skillsFound = skills.filter(skill => htmlContent.includes(skill));
    if (skillsFound.length === 0) {
      errors.push('No skills found in generated HTML');
    } else if (skillsFound.length < skills.length * 0.5) {
      errors.push(`Only ${skillsFound.length}/${skills.length} skills found in generated HTML`);
    }
  }

  // Check for work experience
  const workExperience = sourceData.parsedSections.workExperience;
  if (workExperience && workExperience.length > 0) {
    const firstExp = workExperience[0];
    if (firstExp.company && !htmlContent.includes(firstExp.company)) {
      errors.push(`Company "${firstExp.company}" not found in generated HTML`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract text content from HTML for validation
 * Removes HTML tags to get plain text
 */
export function extractTextFromHTML(htmlContent: string): string {
  // Simple HTML tag removal (for basic validation)
  return htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate PDF generation result
 * Can be extended to check PDF binary content if needed
 */
export function validatePDFGeneration(
  htmlContent: string,
  sourceData: ParsedResumeData
): { valid: boolean; errors: string[]; warnings: string[] } {
  const { valid, errors } = validateHTMLContent(htmlContent, sourceData);
  const warnings: string[] = [];

  // Check for potential ATS issues
  if (htmlContent.includes('<img') || htmlContent.includes('<image')) {
    warnings.push('HTML contains images which may not be ATS-friendly');
  }

  if (htmlContent.includes('position: absolute') || htmlContent.includes('position: fixed')) {
    warnings.push('HTML contains absolute/fixed positioning which may affect ATS parsing');
  }

  // Check for text content
  const textContent = extractTextFromHTML(htmlContent);
  if (textContent.length < 100) {
    warnings.push('Generated content seems too short');
  }

  return { valid, errors, warnings };
}
