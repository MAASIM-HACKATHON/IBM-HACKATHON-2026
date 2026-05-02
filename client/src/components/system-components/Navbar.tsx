import { type ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Logo/Brand */}
        <button
          className="flex items-center gap-3 transition hover:opacity-80"
          onClick={() => navigate('/')}
          type="button"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
            <img src="/logo.png" alt="IBM x Bob Logo" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">IBM x Bob</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">MAASIM TEAM</p>
          </div>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive('/')
                ? 'bg-cyan-400/20 text-cyan-600 dark:text-cyan-300'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
            onClick={() => navigate('/')}
            type="button"
          >
            Home
          </button>
          
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive('/email-composer')
                ? 'bg-cyan-400/20 text-cyan-600 dark:text-cyan-300'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
            onClick={() => navigate('/email-composer')}
            type="button"
          >
            <span className="hidden sm:inline">Email Composer</span>
            <span className="sm:hidden">Email</span>
          </button>

          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive('/resume-builder')
                ? 'bg-purple-400/20 text-purple-600 dark:text-purple-300'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
            onClick={() => navigate('/resume-builder')}
            type="button"
          >
            <span className="hidden sm:inline">Resume Builder</span>
            <span className="sm:hidden">Resume</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
