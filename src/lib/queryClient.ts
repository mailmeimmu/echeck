import { QueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// Create a more robust query client with better error handling and retry logic
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce stale time to refresh data more frequently
      staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: true,
      // Increase retry attempts for better resilience
      retry: 3,
      // Custom retry delay function with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Add error handler for queries
      onError: (error) => {
        console.error('Query error:', error);
        // You could add global error handling here
      }
    },
    mutations: {
      // Add retry for mutations
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Add error handler for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // You could add global error handling here
      }
    }
  },
});

// Listen for auth state changes to clear cache when needed
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    queryClient.clear();
  }
});

// Add connection state monitoring
let isOffline = false;

window.addEventListener('online', () => {
  if (isOffline) {
    console.log('Connection restored, refetching data...');
    queryClient.invalidateQueries();
    isOffline = false;
  }
});

window.addEventListener('offline', () => {
  console.log('Connection lost, switching to offline mode');
  isOffline = true;
});