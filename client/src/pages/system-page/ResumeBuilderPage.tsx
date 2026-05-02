import { type ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeBuilder } from '../../hooks/useResumeBuilder';
import FileUploadSection from '../../components/system-components/resume/FileUploadSection';
import JobDescriptionSection from '../../components/system-components/resume/JobDescriptionSection';
import ActionHub from '../../components/system-components/resume/ActionHub';
import ATSScoreCard from '../../components/system-components/resume/ATSScoreCard';
import ResumePreview from '../../components/system-components/resume/ResumePreview';
import EmailGeneratorModal from '../../components/system-components/resume/EmailGeneratorModal';

function ResumeBuilderPage(): ReactElement {
  const navigate = useNavigate();
  const resumeBuilder = useResumeBuilder();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'optimized'>('split');

  return (
    <main className="min-h-screen px-4 py-10 text-slate-100 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:text-white"
              onClick={() => navigate('/')}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <h1 className="font-['IBM_Plex_Sans','Segoe_UI',sans-serif] text-2xl font-semibold text-white sm:text-3xl">
              AI Resume Builder & ATS Optimizer
            </h1>
          </div>
          {resumeBuilder.parsedData && (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-300 transition hover:border-red-400/50 hover:text-red-200"
              onClick={resumeBuilder.reset}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start Over
            </button>
          )}
        </div>

        {/* Error Display */}
        {resumeBuilder.error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-200">{resumeBuilder.error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Input Sections */}
          <div className="space-y-6 lg:col-span-1">
            {/* File Upload Section */}
            <FileUploadSection
              uploadedFile={resumeBuilder.uploadedFile}
              loading={resumeBuilder.loading}
              onFileUpload={resumeBuilder.handleFileUpload}
              onClearFile={resumeBuilder.clearFile}
            />

            {/* Job Description Section */}
            {resumeBuilder.parsedData && (
              <JobDescriptionSection
                jobDescription={resumeBuilder.jobDescription}
                jobAnalysis={resumeBuilder.jobAnalysis}
                loading={resumeBuilder.loading}
                onJobDescriptionChange={resumeBuilder.setJobDescription}
                onAnalyze={resumeBuilder.analyzeJD}
              />
            )}

            {/* Action Hub */}
            {resumeBuilder.parsedData && resumeBuilder.jobDescription && (
              <ActionHub
                loading={resumeBuilder.loading}
                hasGeneratedResume={!!resumeBuilder.generatedResume}
                hasATSScore={!!resumeBuilder.atsScore}
                onGenerateATSResume={resumeBuilder.generateATSResume}
                onGenerateFullCV={resumeBuilder.generateFullCV}
                onRunATSAnalysis={resumeBuilder.runATSAnalysis}
                onGenerateEmail={() => setShowEmailModal(true)}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6 lg:col-span-2">
            {/* ATS Score Card */}
            {resumeBuilder.atsScore && (
              <ATSScoreCard
                atsScore={resumeBuilder.atsScore}
                jobAnalysis={resumeBuilder.jobAnalysis}
              />
            )}

            {/* Resume Preview */}
            {resumeBuilder.generatedResume && (
              <ResumePreview
                originalResume={resumeBuilder.parsedData}
                generatedResume={resumeBuilder.generatedResume}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}

            {/* Welcome State */}
            {!resumeBuilder.parsedData && !resumeBuilder.loading && (
              <section className="overflow-hidden rounded-[32px] border border-purple-400/20 bg-slate-950/70 shadow-[0_30px_80px_rgba(7,14,26,0.45)] backdrop-blur">
                <div className="px-6 py-16 text-center sm:px-8 lg:px-10">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-purple-400/10 ring-1 ring-purple-400/20">
                    <svg className="h-12 w-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <h2 className="mt-8 font-['IBM_Plex_Sans','Segoe_UI',sans-serif] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Get Started
                  </h2>

                  <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300">
                    Upload your resume or LinkedIn PDF to begin. Our AI will analyze your profile, 
                    optimize it for ATS systems, and help you create tailored resumes for specific job opportunities.
                  </p>

                  <div className="mx-auto mt-12 max-w-3xl">
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-400/10">
                          <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <h3 className="mt-4 font-medium text-white">1. Upload</h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Upload your resume (PDF, DOCX, or TXT)
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                          <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <h3 className="mt-4 font-medium text-white">2. Analyze</h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Add job description for targeted optimization
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
                          <svg className="h-6 w-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="mt-4 font-medium text-white">3. Generate</h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Get ATS-optimized resume and insights
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Email Generator Modal */}
      {showEmailModal && resumeBuilder.generatedResume && (
        <EmailGeneratorModal
          resumeContent={resumeBuilder.generatedResume.generatedResume}
          jobDescription={resumeBuilder.jobDescription}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </main>
  );
}

export default ResumeBuilderPage;
