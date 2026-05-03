import { type ReactElement } from 'react';
import type { JobDescriptionAnalysis } from '../../../types/resume.types';

interface JobDescriptionSectionProps {
  jobDescription: string;
  jobTitle?: string; // NEW
  jobAnalysis?: JobDescriptionAnalysis;
  loading: boolean;
  onJobDescriptionChange: (description: string) => void;
  onJobTitleChange: (title: string) => void; // NEW
  onAnalyze: () => Promise<void>;
}

function JobDescriptionSection({
  jobDescription,
  jobTitle,
  jobAnalysis,
  loading,
  onJobDescriptionChange,
  onJobTitleChange,
  onAnalyze,
}: JobDescriptionSectionProps): ReactElement {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
            <svg className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Job Description</h2>
            <p className="text-sm text-slate-400">Paste the target job posting</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Helper Text */}
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-3">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 shrink-0 text-blue-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-200 leading-relaxed">
              <p className="font-medium mb-1">💡 For best results:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Provide the job title for better role alignment</li>
                <li>Include specific technical skills and technologies</li>
                <li>Add required qualifications and experience level</li>
                <li>Paste the complete job description (minimum 20 characters)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Job Title Input */}
        <div>
          <label htmlFor="job-title" className="block text-sm font-medium text-white mb-2">
            Job Title <span className="text-slate-400 font-normal">(Optional but recommended)</span>
          </label>
          <input
            id="job-title"
            type="text"
            value={jobTitle || ''}
            onChange={(e) => onJobTitleChange(e.target.value)}
            placeholder="e.g., Senior Full-Stack Engineer, Frontend Developer, Data Scientist..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            disabled={loading}
          />
          <p className="mt-1.5 text-xs text-slate-400">
            {jobTitle ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Will use "{jobTitle}" for role-specific optimization
              </span>
            ) : (
              'If not provided, we\'ll try to extract the role from the job description'
            )}
          </p>
        </div>

        {/* Job Description Textarea */}
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-white mb-2">
            Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste the job description here to optimize your resume for this specific role...&#10;&#10;Example: We are looking for a Senior Full Stack Developer with 5+ years of experience in React, Node.js, TypeScript, and AWS. The ideal candidate should have strong problem-solving skills..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            rows={8}
            disabled={loading}
          />
        </div>

        {/* Character count indicator */}
        <div className="flex items-center justify-between text-xs">
          <span className={`${jobDescription.length < 20 ? 'text-amber-400' : 'text-slate-400'}`}>
            {jobDescription.length} characters {jobDescription.length < 20 && '(minimum 20 required)'}
          </span>
          {jobDescription.length >= 20 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ready to analyze
            </span>
          )}
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !jobDescription.trim()}
          className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze Job Description
            </span>
          )}
        </button>

        {/* Analysis Results */}
        {jobAnalysis && (
          <div className="mt-4 space-y-3">
            {/* Keywords */}
            {jobAnalysis.extractedKeywords.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Extracted Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {jobAnalysis.extractedKeywords.slice(0, 10).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200"
                    >
                      {keyword}
                    </span>
                  ))}
                  {jobAnalysis.extractedKeywords.length > 10 && (
                    <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                      +{jobAnalysis.extractedKeywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Experience Level */}
            {jobAnalysis.experienceLevel && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Experience Level</h3>
                <span className="inline-flex items-center rounded-full bg-purple-400/10 px-3 py-1 text-sm font-medium text-purple-200">
                  {jobAnalysis.experienceLevel}
                </span>
              </div>
            )}

            {/* Required Skills */}
            {jobAnalysis.requiredSkills.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {jobAnalysis.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default JobDescriptionSection;
