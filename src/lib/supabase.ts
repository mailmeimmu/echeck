import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

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
    headers: { 'x-application-name': 'check-app' }
  },
  db: {
    schema: 'public'
  }
});

// Add connection health check
export const checkConnection = async () => {
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
};