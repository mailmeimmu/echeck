import { supabase } from '../lib/supabase';

/**
 * Utility function to handle database operations with retry logic
 * @param operation Function that performs the database operation
 * @param maxRetries Maximum number of retry attempts
 * @returns Result of the database operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 5
): Promise<T> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      
      // Retry on connection errors and timeout errors
      if (lastError.message.includes('network') || 
          lastError.message.includes('connection') ||
          lastError.message.includes('timeout') || 
          lastError.message.includes('fetch failed') ||
          lastError.message.includes('aborted')) {
        console.warn(`Database operation attempt ${retries}/${maxRetries} failed, retrying...`);
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, retries) + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry for other errors
      throw lastError;
    }
  }
  
  // If we've exhausted retries, throw the last error
  throw lastError || new Error('Failed after multiple retries');
}

/**
 * Check if the database connection is healthy
 * @returns Connection status information
 */
export async function checkDatabaseConnection() {
  try {
    // Set a timeout for the health check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const start = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    const latency = Date.now() - start;
    
    return {
      isConnected: !error,
      latency,
      error: error?.message
    };
  } catch (error) {
    return {
      isConnected: false,
      latency: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clear Supabase cache to ensure fresh data
 */
export function clearSupabaseCache() {
  // Invalidate React Query cache for all queries
  if (window.queryClient) {
    window.queryClient.invalidateQueries();
  }
  
  // Clear localStorage cache for Supabase
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') && key.includes('cache')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Initialize database connection monitoring
 */
export function initDatabaseMonitoring() {
  // Check connection every minute
  setInterval(async () => {
    try {
      const status = await checkDatabaseConnection();
      if (!status.isConnected) {
        console.warn('Database connection lost, attempting to reconnect...');
        clearSupabaseCache();
      }
    } catch (error) {
      console.error('Error checking database connection:', error);
    }
  }, 60000);
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('Network connection restored, refreshing database connection');
    clearSupabaseCache();
    // Force refresh auth session
    supabase.auth.refreshSession();
  });
  
  window.addEventListener('offline', () => {
    console.warn('Network connection lost');
  });
  
  // Add unhandled rejection handler for fetch errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && 
        typeof event.reason.message === 'string' && 
        event.reason.message.includes('fetch')) {
      console.warn('Unhandled fetch error detected, clearing cache:', event.reason);
      clearSupabaseCache();
    }
  });
}