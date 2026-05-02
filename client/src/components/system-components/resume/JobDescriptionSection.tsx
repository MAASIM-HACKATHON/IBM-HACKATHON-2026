import { type ReactElement } from 'react';
import type { JobDescriptionAnalysis } from '../../../types/resume.types';

interface JobDescriptionSectionProps {
  jobDescription: string;
  jobAnalysis?: JobDescriptionAnalysis;
  loading: boolean;
  onJobDescriptionChange: (description: string) => void;
  onAnalyze: () => Promise<void>;
}

function JobDescriptionSection({
  jobDescription,
  jobAnalysis,
  loading,
  onJobDescriptionChange,
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
        <textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here to optimize your resume for this specific role..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          rows={8}
          disabled={loading}
        />

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
