import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initAuth } from './utils/auth';
import { LanguageProvider } from './providers/LanguageProvider';

// Initialize auth before rendering
initAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);