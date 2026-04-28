import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from('event-photos').getPublicUrl(path);
  return data.publicUrl;
};
