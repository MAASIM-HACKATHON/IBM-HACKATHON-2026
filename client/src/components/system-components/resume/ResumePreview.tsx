import { type ReactElement, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { ParsedResumeData, ResumeGenerationResponse } from '../../../types/resume.types';
import PDFViewer from './PDFViewer';
import PrettyPrinter from './PrettyPrinter';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import {
  generateResumePDFBlob,
  createPDFBlobUrl,
  revokePDFBlobUrl,
  downloadPDFBlob,
  fileToBlobUrl,
} from '../../../services/pdfGenerationService';

interface ResumePreviewProps {
  originalResume?: ParsedResumeData;
  generatedResume: ResumeGenerationResponse;
  viewMode: 'split' | 'original' | 'optimized';
  onViewModeChange: (mode: 'split' | 'original' | 'optimized') => void;
  uploadedFile?: File; // Original uploaded PDF file
  displayMode?: 'pdf' | 'text'; // Display mode for resume content
}

function ResumePreview({
  originalResume,
  generatedResume,
  viewMode,
  onViewModeChange,
  uploadedFile,
  displayMode = 'pdf',
}: ResumePreviewProps): ReactElement {
  // PDF state management
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  const [optimizedPdfUrl, setOptimizedPdfUrl] = useState<string | null>(null);
  const [isGeneratingOriginal, setIsGeneratingOriginal] = useState(false);
  const [isGeneratingOptimized, setIsGeneratingOptimized] = useState(false);
  const [originalError, setOriginalError] = useState<string | null>(null);
  const [optimizedError, setOptimizedError] = useState<string | null>(null);

  // Generate original PDF
  const generateOriginalPDF = useCallback(async () => {
    if (!originalResume) return;

    try {
      setIsGeneratingOriginal(true);
      setOriginalError(null);

      // If we have the uploaded PDF file, use it directly
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        const url = fileToBlobUrl(uploadedFile);
        setOriginalPdfUrl(url);
        toast.success('Original PDF loaded');
      } else {
        // Generate PDF from parsed data
        const blob = await generateResumePDFBlob(originalResume, 'original');
        const url = createPDFBlobUrl(blob);
        setOriginalPdfUrl(url);
        toast.success('Original PDF generated');
      }
    } catch (error) {
      console.error('Error generating original PDF:', error);
      setOriginalError('Failed to generate original PDF');
      toast.error('Failed to generate original PDF');
    } finally {
      setIsGeneratingOriginal(false);
    }
  }, [originalResume, uploadedFile]);

  // Generate optimized PDF
  const generateOptimizedPDF = useCallback(async () => {
    if (!originalResume) return;

    try {
      setIsGeneratingOptimized(true);
      setOptimizedError(null);

      // Create a temporary ParsedResumeData with optimized content
      const optimizedData: ParsedResumeData = {
        ...originalResume,
        rawText: generatedResume.generatedResume,
      };

      const blob = await generateResumePDFBlob(optimizedData, 'optimized');
      const url = createPDFBlobUrl(blob);
      setOptimizedPdfUrl(url);
      toast.success('Optimized PDF generated');
    } catch (error) {
      console.error('Error generating optimized PDF:', error);
      setOptimizedError('Failed to generate optimized PDF');
      toast.error('Failed to generate optimized PDF');
    } finally {
      setIsGeneratingOptimized(false);
    }
  }, [originalResume, generatedResume]);

  // Generate PDFs on mount or data change
  useEffect(() => {
    if (originalResume && !originalPdfUrl && !isGeneratingOriginal) {
      generateOriginalPDF();
    }
  }, [originalResume, originalPdfUrl, isGeneratingOriginal, generateOriginalPDF]);

  useEffect(() => {
    if (originalResume && generatedResume && !optimizedPdfUrl && !isGeneratingOptimized) {
      generateOptimizedPDF();
    }
  }, [originalResume, generatedResume, optimizedPdfUrl, isGeneratingOptimized, generateOptimizedPDF]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPdfUrl) {
        revokePDFBlobUrl(originalPdfUrl);
      }
      if (optimizedPdfUrl) {
        revokePDFBlobUrl(optimizedPdfUrl);
      }
    };
  }, [originalPdfUrl, optimizedPdfUrl]);

  // Download handlers
  const handleDownloadOriginal = async () => {
    if (!originalResume) return;

    try {
      const blob = await generateResumePDFBlob(originalResume, 'original');
      const filename = `${originalResume.parsedSections.personalInfo?.name || 'Resume'}_Original.pdf`;
      downloadPDFBlob(blob, filename);
    } catch (error) {
      toast.error('Failed to download original PDF');
    }
  };

  const handleDownloadOptimized = async () => {
    if (!originalResume) return;

    try {
      const optimizedData: ParsedResumeData = {
        ...originalResume,
        rawText: generatedResume.generatedResume,
      };
      const blob = await generateResumePDFBlob(optimizedData, 'optimized');
      const filename = `${originalResume.parsedSections.personalInfo?.name || 'Resume'}_ATS_Optimized.pdf`;
      downloadPDFBlob(blob, filename);
    } catch (error) {
      toast.error('Failed to download optimized PDF');
    }
  };

  /**
   * Sub-task 19.3: Copy resume text to clipboard
   * Requirement 8.5: Implement copy resume text button
   */
  const handleCopyOriginal = async () => {
    if (!originalResume) return;

    try {
      // Format resume as plain text
      const text = formatResumeAsText(originalResume);
      await navigator.clipboard.writeText(text);
      toast.success('✅ Original resume copied to clipboard');
    } catch (error) {
      console.error('Error copying original resume:', error);
      toast.error('Failed to copy resume text');
    }
  };

  const handleCopyOptimized = async () => {
    if (!originalResume) return;

    try {
      // Use the generated resume text
      const text = generatedResume.generatedResume;
      await navigator.clipboard.writeText(text);
      toast.success('✅ Optimized resume copied to clipboard');
    } catch (error) {
      console.error('Error copying optimized resume:', error);
      toast.error('Failed to copy resume text');
    }
  };

  /**
   * Format resume data as plain text for copying
   */
  const formatResumeAsText = (data: ParsedResumeData): string => {
    const { parsedSections } = data;
    let text = '';

    // Personal Info
    if (parsedSections.personalInfo) {
      const info = parsedSections.personalInfo;
      if (info.name) text += `${info.name.toUpperCase()}\n\n`;
      
      const contactInfo = [];
      if (info.email) contactInfo.push(info.email);
      if (info.phone) contactInfo.push(info.phone);
      if (info.location) contactInfo.push(info.location);
      if (contactInfo.length > 0) {
        text += contactInfo.join(' | ') + '\n';
      }
      
      if (info.linkedin) text += `LinkedIn: ${info.linkedin}\n`;
      if (info.github) text += `GitHub: ${info.github}\n`;
      if (info.portfolio) text += `Portfolio: ${info.portfolio}\n`;
      text += '\n';
    }

    // Professional Summary
    if (parsedSections.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += '─'.repeat(70) + '\n';
      text += `${parsedSections.summary}\n\n`;
    }

    // Technical Skills
    if (parsedSections.skills.length > 0) {
      text += 'TECHNICAL SKILLS\n';
      text += '─'.repeat(70) + '\n';
      text += parsedSections.skills.join(' • ') + '\n\n';
    }

    // Professional Experience
    if (parsedSections.workExperience.length > 0) {
      text += 'PROFESSIONAL EXPERIENCE\n';
      text += '─'.repeat(70) + '\n';
      
      parsedSections.workExperience.forEach((exp) => {
        text += `\n${exp.title}\n`;
        text += `${exp.company}`;
        if (exp.location) text += ` | ${exp.location}`;
        if (exp.duration) text += ` | ${exp.duration}`;
        text += '\n\n';
        
        if (exp.description) {
          text += `${exp.description}\n\n`;
        }
        
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach(achievement => {
            text += `• ${achievement}\n`;
          });
          text += '\n';
        }
        
        if (exp.skills && exp.skills.length > 0) {
          text += `Technologies: ${exp.skills.join(', ')}\n\n`;
        }
      });
    }

    // Projects
    if (parsedSections.projects.length > 0) {
      text += 'PROJECTS\n';
      text += '─'.repeat(70) + '\n';
      
      parsedSections.projects.forEach((project) => {
        text += `\n${project.name}\n`;
        if (project.role) {
          text += `${project.role}`;
          if (project.duration) text += ` | ${project.duration}`;
          text += '\n';
        }
        text += `${project.description}\n`;
        
        if (project.achievements && project.achievements.length > 0) {
          project.achievements.forEach(achievement => {
            text += `• ${achievement}\n`;
          });
        }
        
        if (project.technologies && project.technologies.length > 0) {
          text += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        
        if (project.link) {
          text += `Link: ${project.link}\n`;
        }
        text += '\n';
      });
    }

    // Education
    if (parsedSections.education.length > 0) {
      text += 'EDUCATION\n';
      text += '─'.repeat(70) + '\n';
      
      parsedSections.education.forEach(edu => {
        text += `\n${edu.degree}`;
        if (edu.field) text += ` in ${edu.field}`;
        text += '\n';
        
        text += `${edu.institution}`;
        if (edu.location) text += ` | ${edu.location}`;
        if (edu.year) text += ` | ${edu.year}`;
        text += '\n';
        
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        if (edu.honors && edu.honors.length > 0) {
          text += `Honors: ${edu.honors.join(', ')}\n`;
        }
        text += '\n';
      });
    }

    // Certifications
    if (parsedSections.certifications.length > 0) {
      text += 'CERTIFICATIONS\n';
      text += '─'.repeat(70) + '\n';
      
      parsedSections.certifications.forEach(cert => {
        text += `• ${cert}\n`;
      });
      text += '\n';
    }

    return text;
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
              <svg className="h-5 w-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Resume Preview</h2>
              <p className="text-sm text-slate-400">
                {displayMode === 'pdf' ? 'Professional PDF view with controls' : 'Formatted text view with copy functionality'}
              </p>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => onViewModeChange('split')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'split'
                  ? 'bg-purple-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Split
            </button>
            <button
              onClick={() => onViewModeChange('original')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'original'
                  ? 'bg-purple-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Original
            </button>
            <button
              onClick={() => onViewModeChange('optimized')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'optimized'
                  ? 'bg-purple-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Optimized
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* PDF Display Mode */}
        {displayMode === 'pdf' && (
          <>
            {/* Split View */}
            {viewMode === 'split' && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Original PDF */}
                <div className="space-y-3">
                  {isGeneratingOriginal ? (
                    <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                        <p className="text-sm text-slate-400">Generating original PDF...</p>
                      </div>
                    </div>
                  ) : originalError ? (
                    <div className="flex h-[700px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                      <div className="text-center">
                        <p className="mb-2 text-sm text-red-300">{originalError}</p>
                        <button
                          onClick={generateOriginalPDF}
                          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                          type="button"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : originalPdfUrl ? (
                    <PDFViewer
                      pdfUrl={originalPdfUrl}
                      title="Original Resume"
                      subtitle="Before optimization"
                      badge={{ text: 'Before', color: 'blue' }}
                      height="800px"
                      onLoadError={(error) => {
                        console.error('Original PDF load error:', error);
                        setOriginalError(error.message);
                      }}
                    />
                  ) : (
                    <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <p className="text-sm text-slate-400">No original resume available</p>
                    </div>
                  )}
                </div>

                {/* Optimized PDF */}
                <div className="space-y-3">
                  {isGeneratingOptimized ? (
                    <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
                        <p className="text-sm text-slate-400">Generating optimized PDF...</p>
                      </div>
                    </div>
                  ) : optimizedError ? (
                    <div className="flex h-[700px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                      <div className="text-center">
                        <p className="mb-2 text-sm text-red-300">{optimizedError}</p>
                        <button
                          onClick={generateOptimizedPDF}
                          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                          type="button"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : optimizedPdfUrl ? (
                    <PDFViewer
                      pdfUrl={optimizedPdfUrl}
                      title="Optimized Resume"
                      subtitle="ATS-optimized version"
                      badge={{ text: 'After', color: 'emerald' }}
                      height="800px"
                      onLoadError={(error) => {
                        console.error('Optimized PDF load error:', error);
                        setOptimizedError(error.message);
                      }}
                    />
                  ) : (
                    <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <p className="text-sm text-slate-400">No optimized resume available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Original Only */}
            {viewMode === 'original' && (
              <div className="space-y-3">
                {isGeneratingOriginal ? (
                  <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                      <p className="text-sm text-slate-400">Generating original PDF...</p>
                    </div>
                  </div>
                ) : originalError ? (
                  <div className="flex h-[800px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                    <div className="text-center">
                      <p className="mb-2 text-sm text-red-300">{originalError}</p>
                      <button
                        onClick={generateOriginalPDF}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : originalPdfUrl ? (
                  <PDFViewer
                    pdfUrl={originalPdfUrl}
                    title="Original Resume"
                    subtitle="Before optimization"
                    badge={{ text: 'Before Optimization', color: 'blue' }}
                    height="800px"
                    onLoadError={(error) => {
                      console.error('Original PDF load error:', error);
                      setOriginalError(error.message);
                    }}
                  />
                ) : (
                  <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <p className="text-sm text-slate-400">No original resume available</p>
                  </div>
                )}
              </div>
            )}

            {/* Optimized Only */}
            {viewMode === 'optimized' && (
              <div className="space-y-3">
                {isGeneratingOptimized ? (
                  <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
                      <p className="text-sm text-slate-400">Generating optimized PDF...</p>
                    </div>
                  </div>
                ) : optimizedError ? (
                  <div className="flex h-[800px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                    <div className="text-center">
                      <p className="mb-2 text-sm text-red-300">{optimizedError}</p>
                      <button
                        onClick={generateOptimizedPDF}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : optimizedPdfUrl ? (
                  <PDFViewer
                    pdfUrl={optimizedPdfUrl}
                    title="Optimized Resume"
                    subtitle="ATS-optimized version"
                    badge={{ text: 'ATS-Optimized', color: 'emerald' }}
                    height="800px"
                    onLoadError={(error) => {
                      console.error('Optimized PDF load error:', error);
                      setOptimizedError(error.message);
                    }}
                  />
                ) : (
                  <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <p className="text-sm text-slate-400">No optimized resume available</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Text Display Mode - Sub-task 19.2: PrettyPrinter for resume formatting */}
        {displayMode === 'text' && originalResume && (
          <>
            {/* Split View */}
            {viewMode === 'split' && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Original Resume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      <h3 className="text-sm font-semibold text-white">Original Resume</h3>
                    </div>
                    {/* Sub-task 19.3: Copy button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOriginal}
                      className="border-blue-400/30 bg-blue-400/10 text-blue-200 hover:bg-blue-400/20"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-h-[800px] overflow-y-auto">
                    <PrettyPrinter data={originalResume} />
                  </div>
                </div>

                {/* Optimized Resume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      <h3 className="text-sm font-semibold text-white">Optimized Resume</h3>
                    </div>
                    {/* Sub-task 19.3: Copy button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOptimized}
                      className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-h-[800px] overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">
                        {generatedResume.generatedResume}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Original Only */}
            {viewMode === 'original' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <h3 className="text-sm font-semibold text-white">Original Resume</h3>
                  </div>
                  {/* Sub-task 19.3: Copy button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyOriginal}
                    className="border-blue-400/30 bg-blue-400/10 text-blue-200 hover:bg-blue-400/20"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-h-[800px] overflow-y-auto">
                  <PrettyPrinter data={originalResume} />
                </div>
              </div>
            )}

            {/* Optimized Only */}
            {viewMode === 'optimized' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                    <h3 className="text-sm font-semibold text-white">Optimized Resume</h3>
                  </div>
                  {/* Sub-task 19.3: Copy button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyOptimized}
                    className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-h-[800px] overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">
                      {generatedResume.generatedResume}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* AI Suggestions */}
        {generatedResume.suggestions.length > 0 && (
          <div className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100 mb-3">AI Suggestions</h3>
            <ul className="space-y-2">
              {generatedResume.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-cyan-200/80">
                  <svg className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weak Sections Alert */}
        {generatedResume.weakSections.length > 0 && (
          <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4">
            <h3 className="text-sm font-semibold text-yellow-100 mb-3">⚠ Weak Sections</h3>
            <ul className="space-y-2">
              {generatedResume.weakSections.map((section, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-yellow-200/80">
                  <svg className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {section}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Download Actions - Sub-task 19.3: Export functionality */}
        <div className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={handleDownloadOriginal}
              disabled={!originalPdfUrl || isGeneratingOriginal}
              variant="outline"
              className="border-purple-400/30 bg-purple-400/10 text-purple-200 hover:bg-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Original PDF
            </Button>

            <Button
              onClick={handleDownloadOptimized}
              disabled={!optimizedPdfUrl || isGeneratingOptimized}
              variant="outline"
              className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Optimized PDF
            </Button>
          </div>

          <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-3">
            <p className="text-xs text-blue-200 leading-relaxed">
              💡 <strong>Tip:</strong> Use the zoom and navigation controls in the PDF viewer for better readability. 
              The PDFs are professionally formatted and optimized for ATS systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResumePreview;

// Made with Bob
