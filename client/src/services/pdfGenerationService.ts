/**
 * PDF Generation Service
 * Handles PDF blob creation, management, and conversion for resume display
 * Includes automatic validation and sanitization for robust PDF generation
 */

import { jsPDF } from 'jspdf';
import type { ParsedResumeData } from '../types/resume.types';

/**
 * Sanitize and validate data before PDF generation
 */
function sanitizeResumeData(data: ParsedResumeData): ParsedResumeData {
  const sanitized = { ...data };
  
  // Ensure parsedSections exists
  if (!sanitized.parsedSections) {
    sanitized.parsedSections = {
      personalInfo: undefined,
      summary: '',
      skills: [],
      workExperience: [],
      education: [],
      projects: [],
      certifications: [],
    };
  }
  
  // Sanitize arrays - ensure they exist and contain valid data
  const sections = sanitized.parsedSections;
  
  sections.skills = Array.isArray(sections.skills)
    ? sections.skills.filter(s => s && typeof s === 'string').map(s => s.trim())
    : [];
  
  sections.workExperience = Array.isArray(sections.workExperience)
    ? sections.workExperience.filter(exp => exp && typeof exp === 'object')
    : [];
  
  sections.education = Array.isArray(sections.education)
    ? sections.education.filter(edu => edu && typeof edu === 'object')
    : [];
  
  sections.projects = Array.isArray(sections.projects)
    ? sections.projects.filter(proj => proj && typeof proj === 'object')
    : [];
  
  sections.certifications = Array.isArray(sections.certifications)
    ? sections.certifications.map(cert => sanitizeCertification(cert)).filter((c): c is string => c !== null)
    : [];
  
  return sanitized;
}

/**
 * Sanitize certification data - handle objects, strings, and invalid data
 */
function sanitizeCertification(cert: any): string | null {
  if (!cert) return null;
  
  // If it's already a string, return it
  if (typeof cert === 'string') {
    return cert.trim();
  }
  
  // If it's an object, try to extract meaningful text
  if (typeof cert === 'object') {
    // Try common property names
    const possibleNames = ['name', 'title', 'certification', 'certificationName', 'description'];
    
    for (const prop of possibleNames) {
      if (cert[prop] && typeof cert[prop] === 'string') {
        return cert[prop].trim();
      }
    }
    
    // If no known property, try to create a readable string
    if (cert.name || cert.issuer || cert.date) {
      const parts = [];
      if (cert.name) parts.push(cert.name);
      if (cert.issuer) parts.push(`(${cert.issuer})`);
      if (cert.date) parts.push(`- ${cert.date}`);
      return parts.join(' ');
    }
  }
  
  // Last resort: return null to filter out
  return null;
}

/**
 * Sanitize text content - remove problematic characters
 */
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Remove null bytes and other control characters
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Validate and sanitize array data (currently unused but kept for future use)
 */
// function sanitizeArray<T>(arr: any, validator: (item: any) => T | null): T[] {
//   if (!Array.isArray(arr)) return [];
//   return arr.map(validator).filter((item): item is T => item !== null);
// }

// PDF Generation Options
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

// PDF Metadata
export interface PDFMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
}

// Default options
const DEFAULT_OPTIONS: Required<PDFGenerationOptions> = {
  fontSize: 10,
  fontFamily: 'helvetica',
  lineHeight: 1.4,
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  pageSize: 'A4',
  orientation: 'portrait',
};

/**
 * Generate PDF blob from resume data
 */
export async function generateResumePDFBlob(
  data: ParsedResumeData,
  type: 'original' | 'optimized',
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Sanitize data first to prevent formatting issues
    const sanitizedData = sanitizeResumeData(data);
    
    // Format resume content
    const content = formatResumeContent(sanitizedData);
    
    // Create metadata
    const metadata: PDFMetadata = {
      title: `${data.parsedSections.personalInfo?.name || 'Resume'} - ${type === 'original' ? 'Original' : 'ATS Optimized'}`,
      author: data.parsedSections.personalInfo?.name || 'Unknown',
      subject: 'Professional Resume',
      keywords: data.parsedSections.skills || [],
      creator: 'IBM Watsonx Resume Builder',
    };
    
    // Generate PDF
    return await textToPDFBlob(content, metadata, mergedOptions);
  } catch (error) {
    console.error('Error generating resume PDF:', error);
    throw new Error('Failed to generate PDF from resume data');
  }
}

/**
 * Convert text content to PDF blob
 */
export async function textToPDFBlob(
  content: string,
  metadata: PDFMetadata,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: mergedOptions.orientation,
      unit: 'pt',
      format: mergedOptions.pageSize.toLowerCase() as 'a4' | 'letter',
    });
    
    // Set metadata
    doc.setProperties({
      title: metadata.title,
      author: metadata.author || 'IBM Watsonx Resume Builder',
      subject: metadata.subject || 'Professional Resume',
      keywords: metadata.keywords?.join(', ') || '',
      creator: metadata.creator || 'IBM Watsonx AI',
    });
    
    // Configure text styling
    doc.setFont(mergedOptions.fontFamily);
    doc.setFontSize(mergedOptions.fontSize);
    
    // Calculate page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - mergedOptions.margins.left - mergedOptions.margins.right;
    const lineHeightPt = mergedOptions.fontSize * mergedOptions.lineHeight;
    
    let y = mergedOptions.margins.top;
    
    // Process content line by line with proper wrapping
    const contentLines = content.split('\n');
    
    contentLines.forEach((line) => {
      // Check if we need a new page
      if (y + lineHeightPt > pageHeight - mergedOptions.margins.bottom) {
        doc.addPage();
        y = mergedOptions.margins.top;
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        y += lineHeightPt;
        return;
      }
      
      // Split long lines to fit width
      const wrappedLines = doc.splitTextToSize(line, maxWidth);
      
      wrappedLines.forEach((wrappedLine: string) => {
        // Check again for page break
        if (y + lineHeightPt > pageHeight - mergedOptions.margins.bottom) {
          doc.addPage();
          y = mergedOptions.margins.top;
        }
        
        doc.text(wrappedLine, mergedOptions.margins.left, y);
        y += lineHeightPt;
      });
    });
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error converting text to PDF:', error);
    throw new Error('Failed to convert text to PDF');
  }
}

/**
 * Format resume content for PDF display
 */
function formatResumeContent(data: ParsedResumeData): string {
  const { parsedSections } = data;
  let content = '';
  
  try {
    // Header - Personal Info (ATS-friendly, clean format)
    if (parsedSections.personalInfo) {
      const info = parsedSections.personalInfo;
      const name = sanitizeText(info.name || 'YOUR NAME');
      content += `${name.toUpperCase()}\n\n`;
      
      const contactInfo = [];
      if (info.email) contactInfo.push(sanitizeText(info.email));
      if (info.phone) contactInfo.push(sanitizeText(info.phone));
      if (info.location) contactInfo.push(sanitizeText(info.location));
      if (contactInfo.length > 0) {
        content += contactInfo.join(' | ') + '\n';
      }
      
      if (info.linkedin) content += `LinkedIn: ${sanitizeText(info.linkedin)}\n`;
      if (info.github) content += `GitHub: ${sanitizeText(info.github)}\n`;
      content += '\n\n';
    }
    
    // Professional Summary
    if (parsedSections.summary) {
      content += 'PROFESSIONAL SUMMARY\n';
      content += '_'.repeat(70) + '\n\n';
      content += `${sanitizeText(parsedSections.summary)}\n\n\n`;
    }
  
  // Technical Skills (ATS-friendly format)
  if (parsedSections.skills.length > 0) {
    content += 'TECHNICAL SKILLS\n';
    content += '_'.repeat(70) + '\n\n';
    content += parsedSections.skills.join(' | ') + '\n\n\n';
  }
  
  // Professional Experience
  if (parsedSections.workExperience.length > 0) {
    content += 'PROFESSIONAL EXPERIENCE\n';
    content += '_'.repeat(70) + '\n\n';
    
    parsedSections.workExperience.forEach((exp, index) => {
      content += `${sanitizeText(exp.title || 'Position')}\n`;
      content += `${sanitizeText(exp.company || 'Company')} | ${sanitizeText(exp.duration || 'Duration')}\n\n`;
      
      if (exp.description) {
        content += `${sanitizeText(exp.description)}\n\n`;
      }
      
      if (exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          if (achievement) {
            content += `• ${sanitizeText(achievement)}\n`;
          }
        });
        content += '\n';
      }
      
      if (exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0) {
        const sanitizedSkills = exp.skills.filter(s => s).map(s => sanitizeText(s));
        if (sanitizedSkills.length > 0) {
          content += `Technologies: ${sanitizedSkills.join(', ')}\n`;
        }
      }
      
      if (index < parsedSections.workExperience.length - 1) {
        content += '\n';
      }
    });
    content += '\n';
  }
  
  // Projects
  if (parsedSections.projects.length > 0) {
    content += 'PROJECTS\n';
    content += '_'.repeat(70) + '\n\n';
    
    parsedSections.projects.forEach((project, index) => {
      content += `${sanitizeText(project.name || 'Project')}\n`;
      content += `${sanitizeText(project.description || '')}\n`;
      
      if (project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0) {
        const sanitizedTech = project.technologies.filter(t => t).map(t => sanitizeText(t));
        if (sanitizedTech.length > 0) {
          content += `Technologies: ${sanitizedTech.join(', ')}\n`;
        }
      }
      
      if (index < parsedSections.projects.length - 1) {
        content += '\n';
      }
    });
    content += '\n';
  }
  
  // Education
  if (parsedSections.education.length > 0) {
    content += 'EDUCATION\n';
    content += '_'.repeat(70) + '\n\n';
    
    parsedSections.education.forEach(edu => {
      const degree = sanitizeText(edu.degree || 'Degree');
      const field = edu.field ? ` in ${sanitizeText(edu.field)}` : '';
      content += `${degree}${field}\n`;
      
      const institution = sanitizeText(edu.institution || 'Institution');
      const year = edu.year ? ` | ${sanitizeText(edu.year)}` : '';
      content += `${institution}${year}\n`;
      
      if (edu.gpa) content += `GPA: ${sanitizeText(edu.gpa)}\n`;
      content += '\n';
    });
  }
  
  // Certifications
  if (parsedSections.certifications && parsedSections.certifications.length > 0) {
    content += 'CERTIFICATIONS\n';
    content += '_'.repeat(70) + '\n\n';
    
    parsedSections.certifications.forEach(cert => {
      // Certifications are already sanitized by sanitizeResumeData
      if (cert && typeof cert === 'string') {
        content += `• ${sanitizeText(cert)}\n`;
      }
    });
    content += '\n';
  }
  
    // Footer
    content += '\n' + '_'.repeat(70) + '\n';
    
    return content;
  } catch (error) {
    console.error('Error formatting resume content:', error);
    // Return a safe fallback
    return 'Error generating resume content. Please try again.';
  }
}

/**
 * Create blob URL for PDF display
 */
export function createPDFBlobUrl(blob: Blob): string {
  try {
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating blob URL:', error);
    throw new Error('Failed to create blob URL');
  }
}

/**
 * Revoke blob URL to free memory
 */
export function revokePDFBlobUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error revoking blob URL:', error);
  }
}

/**
 * Download PDF blob as file
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  try {
    const url = createPDFBlobUrl(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    revokePDFBlobUrl(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Invalid file type. Please upload a PDF file.' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }
  
  return { valid: true };
}

/**
 * Convert File to blob URL
 */
export function fileToBlobUrl(file: File): string {
  return createPDFBlobUrl(file);
}

// Made with Bob