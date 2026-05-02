import { type ReactElement } from 'react';
import type { ParsedResumeData, ResumeGenerationResponse } from '../../../types/resume.types';
import { formatResumeForDisplay } from '../../../services/resumeService';

interface ResumePreviewProps {
  originalResume?: ParsedResumeData;
  generatedResume: ResumeGenerationResponse;
  viewMode: 'split' | 'original' | 'optimized';
  onViewModeChange: (mode: 'split' | 'original' | 'optimized') => void;
}

function ResumePreview({
  originalResume,
  generatedResume,
  viewMode,
  onViewModeChange,
}: ResumePreviewProps): ReactElement {
  const originalText = originalResume ? formatResumeForDisplay(originalResume) : '';

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
              <p className="text-sm text-slate-400">Compare original and optimized versions</p>
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
        {/* Split View */}
        {viewMode === 'split' && (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Original */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Original</h3>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">
                  Before
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-slate-300 font-mono">
                  {originalText || 'No original resume available'}
                </pre>
              </div>
            </div>

            {/* Optimized */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Optimized</h3>
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300">
                  After
                </span>
              </div>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-emerald-100 font-mono">
                  {generatedResume.generatedResume}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Original Only */}
        {viewMode === 'original' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Original Resume</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">
                Before Optimization
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-h-[700px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono">
                {originalText || 'No original resume available'}
              </pre>
            </div>
          </div>
        )}

        {/* Optimized Only */}
        {viewMode === 'optimized' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Optimized Resume</h3>
              <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300">
                ATS-Optimized
              </span>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6 max-h-[700px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-emerald-100 font-mono">
                {generatedResume.generatedResume}
              </pre>
            </div>
          </div>
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

        {/* Download Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              const blob = new Blob([generatedResume.generatedResume], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'optimized-resume.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/20"
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Resume
            </span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedResume.generatedResume);
            }}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResumePreview;
