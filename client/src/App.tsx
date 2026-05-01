import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/system-page/HomePage';

function App(): JSX.Element {
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
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
