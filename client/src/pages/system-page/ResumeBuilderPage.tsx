import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

function ResumeBuilderPage(): ReactElement {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-16">
        {/* Header with Back Button */}
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
        </div>

        {/* Coming Soon Section */}
        <section className="overflow-hidden rounded-[32px] border border-purple-400/20 bg-slate-950/70 shadow-[0_30px_80px_rgba(7,14,26,0.45)] backdrop-blur">
          <div className="px-6 py-16 text-center sm:px-8 lg:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-100">
              Coming Soon
            </div>

            <div className="mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-purple-400/10 ring-1 ring-purple-400/20">
              <svg className="h-12 w-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h1 className="mt-8 font-['IBM_Plex_Sans','Segoe_UI',sans-serif] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              AI Resume Builder & ATS Optimizer
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              We're working hard to bring you an intelligent resume builder powered by IBM Watsonx AI. 
              Create ATS-friendly resumes, get optimization suggestions, and maximize your job prospects.
            </p>

            <div className="mx-auto mt-12 max-w-3xl">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-400/10">
                    <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-medium text-white">AI-Powered Generation</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Generate professional resume content with Watsonx AI
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                    <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-medium text-white">ATS Compatibility</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Ensure your resume passes Applicant Tracking Systems
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
                    <svg className="h-6 w-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-medium text-white">Real-Time Optimization</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Get instant feedback and improvement suggestions
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-purple-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-purple-300"
                onClick={() => navigate('/')}
                type="button"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ResumeBuilderPage;
