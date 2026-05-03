import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateResumePDFBlob,
  createPDFBlobUrl,
  revokePDFBlobUrl,
  validatePDFFile,
} from '../pdfGenerationService';
import type { ParsedResumeData } from '../../types/resume.types';

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    jsPDF: class MockJsPDF {
      setProperties = vi.fn();
      setFont = vi.fn();
      setFontSize = vi.fn();
      internal = {
        pageSize: {
          getWidth: () => 595,
          getHeight: () => 842,
        },
      };
      splitTextToSize = vi.fn((text: string) => [text]);
      text = vi.fn();
      addPage = vi.fn();
      output = vi.fn(() => new Blob(['mock-pdf'], { type: 'application/pdf' }));
    },
  };
});;

describe('PDF Generation Service', () => {
  const mockResumeData: ParsedResumeData = {
    rawText: 'Test resume content',
    parsedSections: {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        location: 'New York, NY',
      },
      summary: 'Experienced software engineer',
      skills: ['JavaScript', 'TypeScript', 'React'],
      workExperience: [
        {
          title: 'Senior Developer',
          company: 'Tech Corp',
          duration: '2020-2023',
          description: 'Led development team',
          achievements: ['Improved performance by 50%'],
          skills: ['React', 'Node.js'],
        },
      ],
      projects: [
        {
          name: 'Project Alpha',
          description: 'Built a web application',
          technologies: ['React', 'TypeScript'],
        },
      ],
      education: [
        {
          degree: 'BS Computer Science',
          institution: 'University of Tech',
          year: '2019',
        },
      ],
      certifications: ['AWS Certified Developer'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateResumePDFBlob', () => {
    it('generates PDF blob from resume data', async () => {
      const blob = await generateResumePDFBlob(mockResumeData, 'original');
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    it('handles optimized resume type', async () => {
      const blob = await generateResumePDFBlob(mockResumeData, 'optimized');
      
      expect(blob).toBeInstanceOf(Blob);
    });

    it('handles missing personal info gracefully', async () => {
      const dataWithoutInfo = {
        ...mockResumeData,
        parsedSections: {
          ...mockResumeData.parsedSections,
          personalInfo: undefined,
        },
      };

      const blob = await generateResumePDFBlob(dataWithoutInfo, 'original');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('handles empty arrays gracefully', async () => {
      const dataWithEmptyArrays = {
        ...mockResumeData,
        parsedSections: {
          ...mockResumeData.parsedSections,
          skills: [],
          workExperience: [],
          projects: [],
          education: [],
          certifications: [],
        },
      };

      const blob = await generateResumePDFBlob(dataWithEmptyArrays, 'original');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('sanitizes invalid data', async () => {
      const dataWithInvalidData = {
        ...mockResumeData,
        parsedSections: {
          ...mockResumeData.parsedSections,
          skills: ['Valid Skill', null, undefined, '', '  '] as any,
          certifications: [
            'Valid Cert',
            { name: 'Cert Object' },
            null,
            undefined,
          ] as any,
        },
      };

      const blob = await generateResumePDFBlob(dataWithInvalidData, 'original');
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('createPDFBlobUrl', () => {
    it('creates blob URL from blob', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      const url = createPDFBlobUrl(blob);
      
      expect(url).toBe('blob:mock-url');
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
    });
  });

  describe('revokePDFBlobUrl', () => {
    it('revokes blob URL', () => {
      const url = 'blob:mock-url';
      revokePDFBlobUrl(url);
      
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });
  });

  describe('validatePDFFile', () => {
    it('validates correct PDF file', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = validatePDFFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects non-PDF file', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validatePDFFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('rejects file that is too large', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const result = validatePDFFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('rejects empty file', () => {
      const file = new File([], 'empty.pdf', { type: 'application/pdf' });
      const result = validatePDFFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('validates PDF file by extension when MIME type is missing', () => {
      const file = new File(['test'], 'test.pdf', { type: '' });
      const result = validatePDFFile(file);
      
      expect(result.valid).toBe(true);
    });
  });
});
