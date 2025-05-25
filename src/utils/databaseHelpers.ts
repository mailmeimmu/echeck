import { supabase } from '../lib/supabase';

/**
 * Utility function to handle database operations with retry logic
 * @param operation Function that performs the database operation
 * @param maxRetries Maximum number of retry attempts
 * @returns Result of the database operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      
      // Only retry on connection errors
      if (lastError.message.includes('network') || 
          lastError.message.includes('connection') ||
          lastError.message.includes('timeout') ||
          lastError.message.includes('fetch failed')) {
        console.warn(`Database operation attempt ${retries} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
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
    const start = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
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
  // This is a workaround to force Supabase to refetch data
  // by invalidating the React Query cache for all queries
  if (window.queryClient) {
    window.queryClient.invalidateQueries();
  }
}

/**
 * Initialize database connection monitoring
 */
export function initDatabaseMonitoring() {
  // Check connection every minute
  setInterval(async () => {
    const status = await checkDatabaseConnection();
    if (!status.isConnected) {
      console.warn('Database connection lost, attempting to reconnect...');
      clearSupabaseCache();
    }
  }, 60000);
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('Network connection restored, refreshing database connection');
    clearSupabaseCache();
  });
  
  window.addEventListener('offline', () => {
    console.warn('Network connection lost');
  });
}