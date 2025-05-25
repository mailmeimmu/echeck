import { QueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: true,
      retry: 2,
      networkMode: 'always',
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Listen for auth state changes to clear cache when needed
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    queryClient.clear();
  }
});

// Add global error handler
queryClient.setDefaultOptions({
  mutations: {
    onError: (error) => {
      console.error('Mutation error:', error);
      // Handle global mutation errors
    },
  },
});