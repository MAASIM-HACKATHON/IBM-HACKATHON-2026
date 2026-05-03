/**
 * PDF Exporter Utility
 * Generates PDF files from resume data using server-side template (Blade-like approach)
 */

import type { ParsedResumeData } from '../../types/resume.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Generate and download resume as PDF using server-side template
 * Uses server-generated HTML template (similar to Laravel Blade)
 */
export async function downloadResumeAsPDF(
  data: ParsedResumeData,
  type: 'ats-optimized' | 'full-cv'
): Promise<void> {
  try {
    // Call server-side PDF template generator
    const response = await fetch(`${API_BASE_URL}/resume/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: data,
        isOptimized: type === 'ats-optimized',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF template from server');
    }

    // Get HTML content from server
    const htmlContent = await response.text();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window. Please allow popups.');
    }
    
    // Write the server-generated HTML content
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Trigger print dialog (user can save as PDF)
    printWindow.print();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Download resume as plain text file
 */
export function downloadResumeAsTXT(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Made with Bob
