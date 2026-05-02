import { type ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function Navbar(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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

          {/* Theme Toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30 dark:hover:bg-white/5 dark:hover:text-white"
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
