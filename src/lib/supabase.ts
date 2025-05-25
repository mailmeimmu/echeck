import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add custom fetch implementation with timeout
  fetch: (url, options) => {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Set a timeout of 30 seconds
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    return fetch(url, {
      ...options,
      signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  }
});