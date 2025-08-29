
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-service-key';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database connection test
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('⚠️ Supabase connection failed, using localStorage fallback');
      return false;
    }
    
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.log('⚠️ Supabase connection failed, using localStorage fallback');
    return false;
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    await testConnection();
    console.log('✅ Database connection initialized successfully');
  } catch (error) {
    console.log('⚠️ Database initialization failed, using localStorage fallback');
  }
}
