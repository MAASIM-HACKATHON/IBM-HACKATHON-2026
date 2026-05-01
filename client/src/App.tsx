import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/system-page/HomePage';

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
