
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-service-key';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database abstraction layer
export const db = {
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users from Supabase:', error);
        // Fallback to localStorage for development
        return JSON.parse(localStorage?.getItem('users') || '[]');
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUserStatus(userId: string, status: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date() })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user status in Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  },

  async getUserTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions from Supabase:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async getPendingDepositsWithdrawals() {
    try {
      const { data, error } = await supabase
        .from('deposits_withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deposits/withdrawals from Supabase:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching deposits/withdrawals:', error);
      return [];
    }
  },

  async updateDepositWithdrawalStatus(id: string, status: string, processedBy?: string, rejectionReason?: string) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date()
      };
      
      if (processedBy) updateData.processed_by = processedBy;
      if (rejectionReason) updateData.rejection_reason = rejectionReason;
      if (status === 'approved' || status === 'rejected') updateData.processed_at = new Date();
      
      const { error } = await supabase
        .from('deposits_withdrawals')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating deposit/withdrawal status in Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating deposit/withdrawal status:', error);
      return false;
    }
  }
};

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
