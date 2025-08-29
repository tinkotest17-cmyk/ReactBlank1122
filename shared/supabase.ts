
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// For client-side (browser)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// For server-side
const databaseUrl = process.env.DATABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Database connection for server-side operations
let db: any = null;

export const getDatabase = () => {
  if (!db && databaseUrl && typeof window === 'undefined') {
    try {
      const client = postgres(databaseUrl, {
        ssl: { rejectUnauthorized: false },
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      db = drizzle(client);
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  }
  return db;
};
