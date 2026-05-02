/**
 * PDF Generation Service
 * Handles PDF blob creation, management, and conversion for resume display
 */

import { jsPDF } from 'jspdf';
import type { ParsedResumeData } from '../types/resume.types';

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
    
    // Format resume content
    const content = formatResumeContent(data, type);
    
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
    const textWidth = pageWidth - mergedOptions.margins.left - mergedOptions.margins.right;
    const lineHeightPt = mergedOptions.fontSize * mergedOptions.lineHeight;
    
    // Split content into lines
    const lines = doc.splitTextToSize(content, textWidth);
    let y = mergedOptions.margins.top;
    
    // Add lines to PDF
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (y + lineHeightPt > pageHeight - mergedOptions.margins.bottom) {
        doc.addPage();
        y = mergedOptions.margins.top;
      }
      
      doc.text(line, mergedOptions.margins.left, y);
      y += lineHeightPt;
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
function formatResumeContent(data: ParsedResumeData, type: 'original' | 'optimized'): string {
  const { parsedSections } = data;
  let content = '';
  
  // Header - Personal Info (ATS-friendly, clean format)
  if (parsedSections.personalInfo) {
    const info = parsedSections.personalInfo;
    content += `${(info.name || 'YOUR NAME').toUpperCase()}\n\n`;
    
    const contactInfo = [];
    if (info.email) contactInfo.push(info.email);
    if (info.phone) contactInfo.push(info.phone);
    if (info.location) contactInfo.push(info.location);
    if (contactInfo.length > 0) {
      content += contactInfo.join(' | ') + '\n';
    }
    
    if (info.linkedin) content += `LinkedIn: ${info.linkedin}\n`;
    if (info.github) content += `GitHub: ${info.github}\n`;
    content += '\n\n';
  }
  
  // Professional Summary
  if (parsedSections.summary) {
    content += 'PROFESSIONAL SUMMARY\n';
    content += '_'.repeat(70) + '\n\n';
    content += `${parsedSections.summary}\n\n\n`;
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
      content += `${exp.title}\n`;
      content += `${exp.company} | ${exp.duration}\n\n`;
      
      if (exp.description) {
        content += `${exp.description}\n\n`;
      }
      
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          content += `• ${achievement}\n`;
        });
        content += '\n';
      }
      
      if (exp.skills && exp.skills.length > 0) {
        content += `Technologies: ${exp.skills.join(', ')}\n`;
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
      content += `${project.name}\n`;
      content += `${project.description}\n`;
      
      if (project.technologies && project.technologies.length > 0) {
        content += `Technologies: ${project.technologies.join(', ')}\n`;
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
      content += `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}\n`;
      content += `${edu.institution}${edu.year ? ` | ${edu.year}` : ''}\n`;
      if (edu.gpa) content += `GPA: ${edu.gpa}\n`;
      content += '\n';
    });
  }
  
  // Certifications
  if (parsedSections.certifications.length > 0) {
    content += '═'.repeat(80) + '\n';
    content += 'CERTIFICATIONS\n';
    content += '═'.repeat(80) + '\n\n';
    
    parsedSections.certifications.forEach(cert => {
      content += `  • ${cert}\n`;
    });
    content += '\n';
  }
  
  // Footer
  content += '═'.repeat(80) + '\n';
  content += `Generated on ${new Date().toLocaleDateString()} by IBM Watsonx AI Resume Builder\n`;
  content += '═'.repeat(80) + '\n';
  
  return content;
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