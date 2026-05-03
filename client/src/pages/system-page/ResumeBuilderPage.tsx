import { type ReactElement, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useResumeBuilder } from '../../hooks/useResumeBuilder';
import FileUploadSection from '../../components/system-components/resume/FileUploadSection';
import JobDescriptionSection from '../../components/system-components/resume/JobDescriptionSection';
import ActionHub from '../../components/system-components/resume/ActionHub';
import ATSScoreCard from '../../components/system-components/resume/ATSScoreCard';
import ResumePreview from '../../components/system-components/resume/ResumePreview';
import EmailGeneratorModal from '../../components/system-components/resume/EmailGeneratorModal';

const DRAFT_STORAGE_KEY = 'resume-builder-draft';
const DRAFT_TIMESTAMP_KEY = 'resume-builder-draft-timestamp';

function ResumeBuilderPage(): ReactElement {
  const resumeBuilder = useResumeBuilder();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'ats' | 'cv'>('split');
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
        
        // Restore job description if it exists
        if (parsed.jobDescription) {
          resumeBuilder.setJobDescription(parsed.jobDescription);
        }
        
        // Show toast notification if draft was loaded
        if (timestamp) {
          const savedDate = new Date(timestamp);
          setTimeout(() => {
            toast.success(`📝 Draft restored from ${savedDate.toLocaleString()}`, { duration: 4000 });
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  // Auto-save draft to localStorage whenever job description changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const draftData = {
          jobDescription: resumeBuilder.jobDescription,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        const now = new Date();
        localStorage.setItem(DRAFT_TIMESTAMP_KEY, now.toISOString());
        setLastSaved(now);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [resumeBuilder.jobDescription]);

  const clearDraft = (): void => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
      setLastSaved(null);
      toast.success('Draft cleared');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // Wrapper functions with toast notifications
  const handleFileUpload = async (file: File) => {
    toast.loading(`📄 Processing ${file.name}...`, { id: 'file-upload' });
    try {
      await resumeBuilder.handleFileUpload(file);
      toast.success('✅ Resume uploaded and parsed successfully!', { id: 'file-upload' });
    } catch (error) {
      toast.error('Failed to upload resume', { id: 'file-upload' });
    }
  };

  const handleAnalyzeJD = async () => {
    toast.loading('🔍 Analyzing job description...', { id: 'analyze-jd' });
    try {
      await resumeBuilder.analyzeJD();
      toast.success('✅ Job description analyzed successfully!', { id: 'analyze-jd' });
    } catch (error) {
      toast.error('Failed to analyze job description', { id: 'analyze-jd' });
    }
  };

  const handleGenerateATSResume = async () => {
    toast.loading('🤖 Generating ATS-optimized resume with Watsonx AI...', { id: 'generate-ats' });
    try {
      await resumeBuilder.generateATSResume();
      toast.success('✅ ATS-optimized resume generated!', { id: 'generate-ats' });
    } catch (error) {
      toast.error('Failed to generate ATS resume', { id: 'generate-ats' });
    }
  };

  const handleGenerateFullCV = async () => {
    toast.loading('🤖 Generating full CV with Watsonx AI...', { id: 'generate-cv' });
    try {
      await resumeBuilder.generateFullCV();
      toast.success('✅ Full CV generated!', { id: 'generate-cv' });
    } catch (error) {
      toast.error('Failed to generate full CV', { id: 'generate-cv' });
    }
  };

  const handleRunATSAnalysis = async () => {
    toast.loading('🔍 Running ATS analysis...', { id: 'ats-analysis' });
    try {
      await resumeBuilder.runATSAnalysis();
      toast.success('✅ ATS analysis complete!', { id: 'ats-analysis' });
    } catch (error) {
      toast.error('Failed to run ATS analysis', { id: 'ats-analysis' });
    }
  };

  const handleReset = () => {
    resumeBuilder.reset();
    clearDraft();
    toast.success('🔄 Reset successful');
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 pb-16">
        {/* Hero Section */}
        <section className="overflow-hidden rounded-[32px] border border-purple-400/20 bg-white/80 shadow-[0_20px_70px_rgba(0,0,0,0.1)] backdrop-blur dark:bg-slate-950/70 dark:shadow-[0_30px_80px_rgba(7,14,26,0.45)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-100">
                ✓ IBM watsonx AI Powered
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl font-['IBM_Plex_Sans','Segoe_UI',sans-serif] text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  AI Resume Builder & ATS Optimizer
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Transform your resume with AI-powered optimization. Upload your resume, add a job description, 
                  and get ATS-optimized content with detailed scoring and insights—all powered by IBM Watsonx AI.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-purple-400/30 hover:bg-white/8">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Step 1</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Upload Resume</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Upload PDF, DOCX, or TXT format for AI analysis.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-purple-400/30 hover:bg-white/8">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Step 2</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Add Job Details</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Paste job description for targeted optimization.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-purple-400/30 hover:bg-white/8">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Step 3</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Get ATS Score</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Generate optimized resume with detailed insights.
                  </p>
                </article>
              </div>
            </div>

            <aside className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/8 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20">
                  <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                  System Status
                </p>
              </div>
              
              <div className="mt-4 space-y-2.5 text-sm leading-6 text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Watsonx AI Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>ATS Engine Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Multi-Format Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Email Generator Available</span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-purple-300/15 bg-purple-300/5 p-4 text-xs leading-6 text-slate-300">
                <p className="font-medium text-purple-200">🎯 ATS Optimization</p>
                <p className="mt-2">
                  Our AI analyzes your resume against job requirements, identifies gaps, and generates 
                  ATS-friendly content with keyword optimization.
                </p>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs leading-6 text-slate-300">
                <p className="font-medium text-white">💡 Pro Tip</p>
                <p className="mt-2">
                  Include complete job descriptions for better matching and higher ATS scores.
                </p>
              </div>
            </aside>
          </div>
        </section>


        {/* Main Content - Full Width Layout */}
        <section className="space-y-6">
          {/* Input Section */}
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(3,8,20,0.45)] backdrop-blur sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Input layer</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Resume & Job Details</h2>
                {lastSaved && (
                  <p className="mt-2 text-xs text-slate-400">
                    💾 Draft auto-saved at {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
              {resumeBuilder.parsedData && (
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-300 transition hover:border-red-400/50 hover:bg-red-400/20"
                  onClick={handleReset}
                  type="button"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start Over
                </button>
              )}
            </div>

            <div className="mt-8 space-y-6">
              {/* File Upload Section */}
              <FileUploadSection
                uploadedFile={resumeBuilder.uploadedFile}
                loading={resumeBuilder.loading}
                onFileUpload={handleFileUpload}
                onClearFile={resumeBuilder.clearFile}
              />

              {/* Job Description Section */}
              {resumeBuilder.parsedData && (
                <JobDescriptionSection
                  jobDescription={resumeBuilder.jobDescription}
                  jobTitle={resumeBuilder.jobTitle}
                  jobAnalysis={resumeBuilder.jobAnalysis}
                  loading={resumeBuilder.loading}
                  onJobDescriptionChange={resumeBuilder.setJobDescription}
                  onJobTitleChange={resumeBuilder.setJobTitle}
                  onAnalyze={handleAnalyzeJD}
                />
              )}

              {/* Action Hub */}
              {resumeBuilder.parsedData && resumeBuilder.jobDescription && (
                <ActionHub
                  loading={resumeBuilder.loading}
                  hasGeneratedResume={!!resumeBuilder.generatedResume}
                  hasATSScore={!!resumeBuilder.atsScore}
                  hasJobDescription={!!resumeBuilder.jobDescription}
                  hasJobAnalysis={!!resumeBuilder.jobAnalysis}
                  onGenerateATSResume={handleGenerateATSResume}
                  onGenerateFullCV={handleGenerateFullCV}
                  onRunATSAnalysis={handleRunATSAnalysis}
                  onGenerateEmail={() => setShowEmailModal(true)}
                />
              )}
            </div>
          </div>

          {/* Resume Preview Section - Full Width */}
          {(resumeBuilder.atsResume || resumeBuilder.fullCV || resumeBuilder.generatedResume) && (
            <ResumePreview
              originalResume={resumeBuilder.parsedData}
              generatedResume={resumeBuilder.generatedResume!}
              atsResume={resumeBuilder.atsResume}
              fullCV={resumeBuilder.fullCV}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              uploadedFile={resumeBuilder.uploadedFile?.file}
            />
          )}

          {/* Results & Analysis Section - Below PDF Viewer */}
          {(resumeBuilder.atsScore || (!resumeBuilder.parsedData && !resumeBuilder.loading && !resumeBuilder.generatedResume)) && (
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(3,8,20,0.45)] backdrop-blur sm:p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Output layer</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Results & Analysis</h2>

              <div className="mt-8 space-y-6">
                {/* ATS Score Card */}
                {resumeBuilder.atsScore && (
                  <ATSScoreCard
                    atsScore={resumeBuilder.atsScore}
                    jobAnalysis={resumeBuilder.jobAnalysis}
                  />
                )}

                {/* Welcome State */}
                {!resumeBuilder.parsedData && !resumeBuilder.loading && !resumeBuilder.atsScore && !resumeBuilder.generatedResume && (
                  <div className="space-y-4 rounded-[24px] border border-dashed border-white/15 bg-white/3 p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-400/10">
                      <svg className="h-8 w-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-medium text-white">
                        Ready to optimize your resume
                      </p>
                      <p className="text-sm leading-7 text-slate-300">
                        Upload your resume to begin. Add a job description for targeted optimization
                        and ATS scoring. Results will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Email Generator Modal */}
      {resumeBuilder.generatedResume && (
        <EmailGeneratorModal
          resumeContent={resumeBuilder.generatedResume.generatedResume}
          jobDescription={resumeBuilder.jobDescription}
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
        />
      )}
    </main>
  );
}

export default ResumeBuilderPage;
