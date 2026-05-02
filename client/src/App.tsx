import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/system-components/Navbar';
import HomePage from './pages/system-page/HomePage';
import EmailComposerPage from './pages/system-page/EmailComposerPage';
import ResumeBuilderPage from './pages/system-page/ResumeBuilderPage';
import type { ReactElement } from 'react';

function AppContent(): ReactElement {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {!isHomePage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/email-composer" element={<EmailComposerPage />} />
        <Route path="/resume-builder" element={<ResumeBuilderPage />} />
      </Routes>
    </>
  );
}

function App(): ReactElement {
  return (
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
  );
}

export default App;
