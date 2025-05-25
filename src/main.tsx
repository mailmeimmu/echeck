import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';
import { initAuth } from './utils/auth';
import { initDatabaseMonitoring } from './utils/databaseHelpers';

// Initialize auth before rendering
initAuth();

// Initialize database monitoring
initDatabaseMonitoring();

// Make queryClient available globally for cache invalidation
declare global {
  interface Window {
    queryClient: typeof queryClient;
  }
}
window.queryClient = queryClient;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);