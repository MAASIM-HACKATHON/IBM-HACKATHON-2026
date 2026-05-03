import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ReactElement } from 'react';

// Lazy load page components for code splitting (Requirement 19.2)
const HomePage = lazy(() => import('./pages/system-page/HomePage'));
const EmailComposerPage = lazy(() => import('./pages/system-page/EmailComposerPage'));
const EmailGeneratorPage = lazy(() => import('./pages/system-page/EmailGeneratorPage'));
const ResumeBuilderPageModern = lazy(() => import('./pages/system-page/ResumeBuilderPageModern'));

function AppContent(): ReactElement {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/email-composer" element={<EmailComposerPage />} />
          <Route path="/email-generator" element={<EmailGeneratorPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderPageModern />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

function App(): ReactElement {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(103, 232, 249, 0.2)',
              borderRadius: '16px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#67e8f9',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#fb7185',
                secondary: '#0f172a',
              },
            },
          }}
        />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
