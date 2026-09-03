import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment variables or localStorage override
const getSupabaseEnv = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('topgss_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('topgss_supabase_key') : null;

  const url = (localUrl && localUrl.trim() !== '') ? localUrl.trim() : (envUrl && envUrl.trim() !== '' ? envUrl.trim() : '');
  const key = (localKey && localKey.trim() !== '') ? localKey.trim() : (envKey && envKey.trim() !== '' ? envKey.trim() : '');

  return { url, key };
};

const { url: initialUrl, key: initialKey } = getSupabaseEnv();

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseEnv();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key.length > 20
  );
};

// Fallback dummy for safe module loading if env vars aren't injected yet
const defaultUrl = initialUrl || 'https://xyzcompanytopgss.supabase.co';
const defaultKey = initialKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase: SupabaseClient = createClient(defaultUrl, defaultKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('topgss_supabase_url', url.trim());
    localStorage.setItem('topgss_supabase_key', key.trim());
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('topgss_supabase_url');
    localStorage.removeItem('topgss_supabase_key');
    window.location.reload();
  }
};
