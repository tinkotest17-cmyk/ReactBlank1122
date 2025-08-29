
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found, using mock mode');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Test connection
export async function testSupabaseConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return false;
  }
}
