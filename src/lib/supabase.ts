import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Network status check
const checkNetworkStatus = () => navigator.onLine;

// Validate Supabase URL format
const isValidSupabaseUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!isValidSupabaseUrl(supabaseUrl)) {
  throw new Error('Invalid Supabase URL format');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  },
  // Enhanced fetch with better error handling and retry logic
  fetch: (url, options) => {
    const retries = 3;
    let attempt = 0;
    
    const fetchWithRetry = async (): Promise<Response> => {
      try {
        // Check network status before attempting fetch
        if (!checkNetworkStatus()) {
          throw new Error('No network connection available');
        }

        attempt++;
        console.log(`Attempt ${attempt} of ${retries} to fetch ${url}`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options?.headers,
            'Cache-Control': 'no-cache',
          }
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        const isTimeoutError = error instanceof Error && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
        
        console.error(`Fetch attempt ${attempt} failed:`, {
          error,
          isTimeoutError,
          isNetworkError,
          url
        });

        if (attempt === retries) {
          throw new Error(`Failed to fetch after ${retries} attempts: ${error.message}`);
        }

        // Exponential backoff with jitter
        const backoff = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
        console.log(`Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        
        return fetchWithRetry();
      }
    };
    
    return fetchWithRetry();
  }
});

// Enhanced error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  } else if (event === 'USER_DELETED') {
    console.error('User account was deleted');
  }
});

// Enhanced health check function
export const checkSupabaseConnection = async () => {
  try {
    if (!checkNetworkStatus()) {
      throw new Error('No network connection available');
    }

    const startTime = performance.now();
    const { data, error } = await supabase.from('users_profile').select('count').limit(1);
    const endTime = performance.now();
    
    if (error) throw error;
    
    console.log(`Supabase connection healthy (${Math.round(endTime - startTime)}ms)`);
    return true;
  } catch (error) {
    console.error('Supabase connection error:', {
      error,
      url: supabaseUrl,
      networkOnline: checkNetworkStatus(),
      timestamp: new Date().toISOString()
    });
    return false;
  }
};