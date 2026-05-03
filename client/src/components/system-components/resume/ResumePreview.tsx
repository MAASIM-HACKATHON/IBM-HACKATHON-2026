import { type ReactElement, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { ParsedResumeData, ResumeGenerationResponse } from '../../../types/resume.types';
import PDFViewer from './PDFViewer';
import {
  generateResumePDFBlob,
  createPDFBlobUrl,
  revokePDFBlobUrl,
  downloadPDFBlob,
  fileToBlobUrl,
} from '../../../services/pdfGenerationService';

interface ResumePreviewProps {
  originalResume?: ParsedResumeData;
  generatedResume: ResumeGenerationResponse; // Keep for backward compatibility
  atsResume?: ResumeGenerationResponse; // ATS-Optimized Resume
  fullCV?: ResumeGenerationResponse; // Full CV
  viewMode: 'split' | 'original' | 'ats' | 'cv';
  onViewModeChange: (mode: 'split' | 'original' | 'ats' | 'cv') => void;
  uploadedFile?: File; // Original uploaded PDF file
}

function ResumePreview({
  originalResume,
  generatedResume,
  atsResume,
  fullCV,
  viewMode,
  onViewModeChange,
  uploadedFile,
}: ResumePreviewProps): ReactElement {
  // PDF state management
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  const [atsPdfUrl, setAtsPdfUrl] = useState<string | null>(null);
  const [cvPdfUrl, setCvPdfUrl] = useState<string | null>(null);
  const [isGeneratingOriginal, setIsGeneratingOriginal] = useState(false);
  const [isGeneratingAts, setIsGeneratingAts] = useState(false);
  const [isGeneratingCv, setIsGeneratingCv] = useState(false);
  const [originalError, setOriginalError] = useState<string | null>(null);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  // Track previous content to detect changes
  const prevAtsContentRef = useRef<string | null>(null);
  const prevCvContentRef = useRef<string | null>(null);

  // Determine which resume to show based on view mode
  let displayedResume: ResumeGenerationResponse | undefined;
  let resumeType: 'ats' | 'cv' = 'ats';

  if (viewMode === 'ats' && atsResume) {
    displayedResume = atsResume;
    resumeType = 'ats';
  } else if (viewMode === 'cv' && fullCV) {
    displayedResume = fullCV;
    resumeType = 'cv';
  } else if (viewMode === 'split') {
    // In split view, show the most recently generated on the right
    displayedResume = fullCV || atsResume || generatedResume;
    resumeType = fullCV ? 'cv' : 'ats';
  } else {
    // Fallback: show whatever is available
    displayedResume = atsResume || fullCV || generatedResume;
    resumeType = atsResume ? 'ats' : fullCV ? 'cv' : 'ats';
  }

  // 🔥 DEBUG: Log what's being displayed
  console.log('🔥 RESUME PREVIEW: Determining which resume to display');
  console.log('   View mode:', viewMode);
  console.log('   Has atsResume:', !!atsResume);
  console.log('   Has fullCV:', !!fullCV);
  console.log('   Has generatedResume:', !!generatedResume);
  console.log('   Displaying:', resumeType);
  console.log('   Content length:', displayedResume?.generatedResume?.length || 0);
  console.log('   Content preview:', displayedResume?.generatedResume?.substring(0, 200));

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

  // Generate ATS PDF
  const generateAtsPDF = useCallback(async () => {
    if (!originalResume || !atsResume) return;

    console.log('🔥 PDF GENERATION: generateAtsPDF called');
    console.log('   atsResume.generatedResume length:', atsResume.generatedResume.length);
    console.log('   atsResume.generatedResume first 500 chars:', atsResume.generatedResume.substring(0, 500));

    try {
      setIsGeneratingAts(true);
      setAtsError(null);

      // Store old URL to revoke after new one is set
      const oldUrl = atsPdfUrl;

      const atsData: ParsedResumeData = {
        ...originalResume,
        rawText: atsResume.generatedResume,
      };

      console.log('🔥 PDF GENERATION: Creating ATS PDF blob...');
      const blob = await generateResumePDFBlob(atsData, 'optimized');
      console.log('   Blob size:', blob.size, 'bytes');
      
      const url = createPDFBlobUrl(blob);
      console.log('   Blob URL created:', url);
      
      setAtsPdfUrl(url);
      
      // Revoke old URL after new one is set
      if (oldUrl) {
        setTimeout(() => {
          console.log('🔥 PDF GENERATION: Revoking old ATS URL:', oldUrl);
          revokePDFBlobUrl(oldUrl);
        }, 100);
      }
      
      toast.success('ATS Resume PDF generated');
      console.log('✅ PDF GENERATION: ATS PDF generated successfully');
    } catch (error) {
      console.error('❌ PDF GENERATION: Error generating ATS PDF:', error);
      setAtsError('Failed to generate ATS PDF');
      toast.error('Failed to generate ATS PDF');
    } finally {
      setIsGeneratingAts(false);
    }
  }, [originalResume, atsResume, atsPdfUrl]);

  // Generate CV PDF
  const generateCvPDF = useCallback(async () => {
    if (!originalResume || !fullCV) return;

    console.log('🔥 PDF GENERATION: generateCvPDF called');
    console.log('   fullCV.generatedResume length:', fullCV.generatedResume.length);
    console.log('   fullCV.generatedResume first 500 chars:', fullCV.generatedResume.substring(0, 500));

    try {
      setIsGeneratingCv(true);
      setCvError(null);

      // Store old URL to revoke after new one is set
      const oldUrl = cvPdfUrl;

      const cvData: ParsedResumeData = {
        ...originalResume,
        rawText: fullCV.generatedResume,
      };

      console.log('🔥 PDF GENERATION: Creating PDF blob...');
      const blob = await generateResumePDFBlob(cvData, 'optimized');
      console.log('   Blob size:', blob.size, 'bytes');
      
      const url = createPDFBlobUrl(blob);
      console.log('   Blob URL created:', url);
      
      setCvPdfUrl(url);
      
      // Revoke old URL after new one is set
      if (oldUrl) {
        setTimeout(() => {
          console.log('🔥 PDF GENERATION: Revoking old URL:', oldUrl);
          revokePDFBlobUrl(oldUrl);
        }, 100);
      }
      
      toast.success('Full CV PDF generated');
      console.log('✅ PDF GENERATION: CV PDF generated successfully');
    } catch (error) {
      console.error('❌ PDF GENERATION: Error generating CV PDF:', error);
      setCvError('Failed to generate CV PDF');
      toast.error('Failed to generate CV PDF');
    } finally {
      setIsGeneratingCv(false);
    }
  }, [originalResume, fullCV, cvPdfUrl]);

  // Generate PDFs on mount or data change
  useEffect(() => {
    if (originalResume && !originalPdfUrl && !isGeneratingOriginal) {
      generateOriginalPDF();
    }
  }, [originalResume, originalPdfUrl, isGeneratingOriginal, generateOriginalPDF]);

  // Regenerate ATS PDF when atsResume content changes (only if no PDF exists or content changed)
  useEffect(() => {
    const currentContent = atsResume?.generatedResume;
    const hasContentChanged = currentContent && currentContent !== prevAtsContentRef.current;
    
    if (originalResume && atsResume && !isGeneratingAts) {
      // Generate if no PDF exists OR content has changed
      if (!atsPdfUrl || hasContentChanged) {
        console.log('🔥 useEffect: Generating ATS PDF', {
          noPdfExists: !atsPdfUrl,
          contentChanged: hasContentChanged,
          prevLength: prevAtsContentRef.current?.length || 0,
          currentLength: currentContent?.length || 0
        });
        generateAtsPDF();
        prevAtsContentRef.current = currentContent || null;
      }
    }
  }, [originalResume, atsResume?.generatedResume, atsPdfUrl, isGeneratingAts]); // Watch for content changes

  // Regenerate CV PDF when fullCV content changes (only if no PDF exists or content changed)
  useEffect(() => {
    const currentContent = fullCV?.generatedResume;
    const hasContentChanged = currentContent && currentContent !== prevCvContentRef.current;
    
    if (originalResume && fullCV && !isGeneratingCv) {
      // Generate if no PDF exists OR content has changed
      if (!cvPdfUrl || hasContentChanged) {
        console.log('🔥 useEffect: Generating CV PDF', {
          noPdfExists: !cvPdfUrl,
          contentChanged: hasContentChanged,
          prevLength: prevCvContentRef.current?.length || 0,
          currentLength: currentContent?.length || 0
        });
        generateCvPDF();
        prevCvContentRef.current = currentContent || null;
      }
    }
  }, [originalResume, fullCV?.generatedResume, cvPdfUrl, isGeneratingCv]); // Watch for content changes

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPdfUrl) {
        revokePDFBlobUrl(originalPdfUrl);
      }
      if (atsPdfUrl) {
        revokePDFBlobUrl(atsPdfUrl);
      }
      if (cvPdfUrl) {
        revokePDFBlobUrl(cvPdfUrl);
      }
    };
  }, [originalPdfUrl, atsPdfUrl, cvPdfUrl]);

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

  const handleDownloadAts = async () => {
    if (!originalResume || !atsResume) return;

    try {
      const atsData: ParsedResumeData = {
        ...originalResume,
        rawText: atsResume.generatedResume,
      };
      const blob = await generateResumePDFBlob(atsData, 'optimized');
      const filename = `${originalResume.parsedSections.personalInfo?.name || 'Resume'}_ATS_Optimized.pdf`;
      downloadPDFBlob(blob, filename);
    } catch (error) {
      toast.error('Failed to download ATS PDF');
    }
  };

  const handleDownloadCv = async () => {
    if (!originalResume || !fullCV) return;

    try {
      const cvData: ParsedResumeData = {
        ...originalResume,
        rawText: fullCV.generatedResume,
      };
      const blob = await generateResumePDFBlob(cvData, 'optimized');
      const filename = `${originalResume.parsedSections.personalInfo?.name || 'Resume'}_Full_CV.pdf`;
      downloadPDFBlob(blob, filename);
    } catch (error) {
      toast.error('Failed to download CV PDF');
    }
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
              <p className="text-sm text-slate-400">Professional PDF view with controls</p>
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
            {atsResume && (
              <button
                onClick={() => onViewModeChange('ats')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  viewMode === 'ats'
                    ? 'bg-purple-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                type="button"
              >
                ATS Resume
              </button>
            )}
            {fullCV && (
              <button
                onClick={() => onViewModeChange('cv')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  viewMode === 'cv'
                    ? 'bg-purple-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                type="button"
              >
                Full CV
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Split View - Show Original vs Latest Generated (ATS or CV) */}
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

            {/* Latest Generated (ATS or CV) */}
            <div className="space-y-3">
              {resumeType === 'ats' && atsResume ? (
                isGeneratingAts ? (
                  <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
                      <p className="text-sm text-slate-400">Generating ATS Resume PDF...</p>
                    </div>
                  </div>
                ) : atsError ? (
                  <div className="flex h-[700px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                    <div className="text-center">
                      <p className="mb-2 text-sm text-red-300">{atsError}</p>
                      <button
                        onClick={generateAtsPDF}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : atsPdfUrl ? (
                  <PDFViewer
                    key={`split-ats-${atsPdfUrl}`}
                    pdfUrl={atsPdfUrl}
                    title="ATS-Optimized Resume"
                    subtitle="Optimized for applicant tracking systems"
                    badge={{ text: 'ATS-Optimized', color: 'emerald' }}
                    height="800px"
                    onLoadError={(error) => {
                      console.error('ATS PDF load error:', error);
                      setAtsError(error.message);
                    }}
                  />
                ) : null
              ) : resumeType === 'cv' && fullCV ? (
                isGeneratingCv ? (
                  <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                      <p className="text-sm text-slate-400">Generating Full CV PDF...</p>
                    </div>
                  </div>
                ) : cvError ? (
                  <div className="flex h-[700px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                    <div className="text-center">
                      <p className="mb-2 text-sm text-red-300">{cvError}</p>
                      <button
                        onClick={generateCvPDF}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                        type="button"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : cvPdfUrl ? (
                  <PDFViewer
                    key={`split-cv-${cvPdfUrl}`}
                    pdfUrl={cvPdfUrl}
                    title="Full CV"
                    subtitle="Comprehensive curriculum vitae"
                    badge={{ text: 'Full CV', color: 'purple' }}
                    height="800px"
                    onLoadError={(error) => {
                      console.error('CV PDF load error:', error);
                      setCvError(error.message);
                    }}
                  />
                ) : null
              ) : (
                <div className="flex h-[700px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <p className="text-sm text-slate-400">No generated resume available</p>
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

        {/* ATS Resume Only */}
        {viewMode === 'ats' && atsResume && (
          <div className="space-y-3">
            {isGeneratingAts ? (
              <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
                  <p className="text-sm text-slate-400">Generating ATS Resume PDF...</p>
                </div>
              </div>
            ) : atsError ? (
              <div className="flex h-[800px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                <div className="text-center">
                  <p className="mb-2 text-sm text-red-300">{atsError}</p>
                  <button
                    onClick={generateAtsPDF}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : atsPdfUrl ? (
              <PDFViewer
                key={`ats-pdf-${atsPdfUrl}`}
                pdfUrl={atsPdfUrl}
                title="ATS-Optimized Resume"
                subtitle="Optimized for applicant tracking systems"
                badge={{ text: 'ATS-Optimized', color: 'emerald' }}
                height="800px"
                onLoadError={(error) => {
                  console.error('ATS PDF load error:', error);
                  setAtsError(error.message);
                }}
              />
            ) : (
              <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <p className="text-sm text-slate-400">No ATS resume available</p>
              </div>
            )}
          </div>
        )}

        {/* Full CV Only */}
        {viewMode === 'cv' && fullCV && (
          <div className="space-y-3">
            {isGeneratingCv ? (
              <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                  <p className="text-sm text-slate-400">Generating Full CV PDF...</p>
                </div>
              </div>
            ) : cvError ? (
              <div className="flex h-[800px] items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10">
                <div className="text-center">
                  <p className="mb-2 text-sm text-red-300">{cvError}</p>
                  <button
                    onClick={generateCvPDF}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : cvPdfUrl ? (
              <PDFViewer
                key={`cv-pdf-${cvPdfUrl}`}
                pdfUrl={cvPdfUrl}
                title="Full CV"
                subtitle="Comprehensive curriculum vitae"
                badge={{ text: 'Full CV', color: 'purple' }}
                height="800px"
                onLoadError={(error) => {
                  console.error('CV PDF load error:', error);
                  setCvError(error.message);
                }}
              />
            ) : (
              <div className="flex h-[800px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <p className="text-sm text-slate-400">No Full CV available</p>
              </div>
            )}
          </div>
        )}

        {/* AI Suggestions */}
        {displayedResume.suggestions.length > 0 && (
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
        {displayedResume.weakSections.length > 0 && (
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

        {/* Download Actions */}
        <div className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={handleDownloadOriginal}
              disabled={!originalPdfUrl || isGeneratingOriginal}
              className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Original
              </span>
            </button>

            {atsResume && (
              <button
                onClick={handleDownloadAts}
                disabled={!atsPdfUrl || isGeneratingAts}
                className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ATS Resume
                </span>
              </button>
            )}

            {fullCV && (
              <button
                onClick={handleDownloadCv}
                disabled={!cvPdfUrl || isGeneratingCv}
                className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Full CV
                </span>
              </button>
            )}
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
