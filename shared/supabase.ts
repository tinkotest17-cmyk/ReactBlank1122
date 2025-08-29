
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const databaseUrl = process.env.DATABASE_URL || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database connection for server-side operations
let db: any = null;

export const getDatabase = () => {
  if (!db && databaseUrl) {
    const client = postgres(databaseUrl);
    db = drizzle(client);
  }
  return db;
};
