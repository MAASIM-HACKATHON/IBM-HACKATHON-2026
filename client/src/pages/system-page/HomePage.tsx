import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage(): ReactElement {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 pb-16">
        {/* Header Section */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
            ✓ IBM watsonx AI Powered
          </div>
          
          <h1 className="mt-8 font-['IBM_Plex_Sans','Segoe_UI',sans-serif] text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            IBM x Bob
          </h1>
          <p className="mt-4 text-xl font-medium text-cyan-300">MAASIM TEAM</p>
          
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Elevate your professional journey with AI-powered tools. Choose from our intelligent 
            solutions designed to streamline your career advancement and communication needs.
          </p>
        </section>

        {/* Feature Cards */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Smart Email Composer Card */}
          <article 
            className="group relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(7,14,26,0.45)] backdrop-blur transition-all hover:border-cyan-400/40 hover:shadow-[0_40px_100px_rgba(103,232,249,0.15)] sm:p-10"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/email-composer')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/email-composer');
              }
            }}
          >
            <div className="absolute right-0 top-0 h-40 w-40 bg-cyan-400/5 blur-3xl"></div>
            
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                <svg className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="mt-6 text-3xl font-semibold text-white">
                Smart Email Composer
              </h2>
              
              <p className="mt-4 text-base leading-7 text-slate-300">
                Generate professional, context-aware emails using IBM's Granite AI model. Perfect for 
                job applications, follow-ups, networking, and business communications.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI-powered content generation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Smart auto-fill from pasted content</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Multiple tone and purpose options</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-cyan-300 transition group-hover:gap-4">
                <span>Get Started</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </article>

          {/* Resume Builder with ATS Checker Card */}
          <article 
            className="group relative overflow-hidden rounded-[32px] border border-purple-400/20 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(7,14,26,0.45)] backdrop-blur transition-all hover:border-purple-400/40 hover:shadow-[0_40px_100px_rgba(192,132,252,0.15)] sm:p-10"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/resume-builder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/resume-builder');
              }
            }}
          >
            <div className="absolute right-0 top-0 h-40 w-40 bg-purple-400/5 blur-3xl"></div>
            
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-400/10 ring-1 ring-purple-400/20">
                <svg className="h-8 w-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h2 className="mt-6 text-3xl font-semibold text-white">
                AI Resume Builder & ATS Optimizer
              </h2>
              
              <p className="mt-4 text-base leading-7 text-slate-300">
                Create ATS-friendly resumes and CVs with AI assistance. Optimize your resume for 
                Applicant Tracking Systems and get real-time feedback to maximize your job prospects.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI-powered resume generation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>ATS compatibility checker</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time optimization suggestions</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-purple-300 transition group-hover:gap-4">
                <span>Get Started</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </article>
        </section>

        {/* Features Overview */}
        <section className="rounded-[32px] border border-white/10 bg-slate-950/50 p-8 backdrop-blur sm:p-10">
          <h3 className="text-center text-2xl font-semibold text-white">
            Powered by IBM Watsonx AI
          </h3>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10">
                <svg className="h-6 w-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="mt-4 font-medium text-white">Lightning Fast</h4>
              <p className="mt-2 text-sm text-slate-400">Generate content in seconds</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10">
                <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="mt-4 font-medium text-white">Enterprise Grade</h4>
              <p className="mt-2 text-sm text-slate-400">IBM's trusted AI technology</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-400/10">
                <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="mt-4 font-medium text-white">Customizable</h4>
              <p className="mt-2 text-sm text-slate-400">Tailor to your specific needs</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-400/10">
                <svg className="h-6 w-6 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="mt-4 font-medium text-white">User Friendly</h4>
              <p className="mt-2 text-sm text-slate-400">Intuitive and easy to use</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-400">
          <p>© 2026 IBM x Bob | MAASIM TEAM. Powered by IBM Watsonx AI.</p>
        </footer>
      </div>
    </main>
  );
}

export default HomePage;
