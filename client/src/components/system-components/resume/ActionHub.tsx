import { type ReactElement } from 'react';

interface ActionHubProps {
  loading: boolean;
  hasGeneratedResume: boolean;
  hasATSScore: boolean;
  onGenerateATSResume: () => Promise<void>;
  onGenerateFullCV: () => Promise<void>;
  onRunATSAnalysis: () => Promise<void>;
  onGenerateEmail: () => void;
}

function ActionHub({
  loading,
  hasGeneratedResume,
  hasATSScore,
  onGenerateATSResume,
  onGenerateFullCV,
  onRunATSAnalysis,
  onGenerateEmail,
}: ActionHubProps): ReactElement {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
            <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Action Hub</h2>
            <p className="text-sm text-slate-400">Generate and analyze</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {/* Generate ATS Resume */}
        <button
          onClick={onGenerateATSResume}
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate ATS-Optimized Resume
          </span>
        </button>

        {/* Generate Full CV */}
        <button
          onClick={onGenerateFullCV}
          disabled={loading}
          className="w-full rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Full CV
          </span>
        </button>

        {/* Run ATS Analysis */}
        <button
          onClick={onRunATSAnalysis}
          disabled={loading}
          className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {hasATSScore ? 'Re-run ATS Analysis' : 'Run ATS Analysis'}
          </span>
        </button>

        {/* Generate Application Email */}
        {hasGeneratedResume && (
          <button
            onClick={onGenerateEmail}
            disabled={loading}
            className="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Generate Application Email
            </span>
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
            <span className="text-sm text-purple-300">Processing...</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default ActionHub;
