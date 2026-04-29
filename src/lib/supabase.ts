import { createClient } from '@supabase/supabase-js';

// These are replaced at build time by Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use actual project URL as fallback during build to prevent prerender crashes
const FALLBACK_URL = 'https://kdqzvfjzgslstzlgaukz.supabase.co';
const FALLBACK_KEY = 'placeholder';

const clientUrl = supabaseUrl || FALLBACK_URL;
const clientKey = supabaseAnonKey || FALLBACK_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using fallback for build compatibility.');
}

export const supabase = createClient(clientUrl, clientKey);

export const getPublicUrl = (path: string) => {
  if (!path) return '';
  const { data } = supabase.storage.from('event-photos').getPublicUrl(path);
  return data.publicUrl;
};
