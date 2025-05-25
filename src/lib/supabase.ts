import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a more robust Supabase client with better connection handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: { 'x-application-name': 'check-app' },
    fetch: customFetch
  },
  db: {
    schema: 'public',
    // Increase timeouts for better stability
    queryTimeout: 30000
  }
});

// Custom fetch implementation with retry logic
async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(input, {
        ...init,
        // Add cache control headers to prevent stale responses
        headers: {
          ...init?.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // If response is not ok, throw an error to trigger retry
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      
      // Only retry on network errors or 5xx server errors
      if (lastError.message.includes('NetworkError') || 
          lastError.message.includes('Status: 5')) {
        console.warn(`Fetch attempt ${retries} failed, retrying in ${RETRY_DELAY}ms...`, lastError);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
      } else {
        // Don't retry for other errors
        break;
      }
    }
  }
  
  // If we've exhausted retries, throw the last error
  throw lastError || new Error('Failed to fetch after multiple retries');
}

// Add connection health check using packages table which has public access
export const checkConnection = async () => {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('packages')
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
};