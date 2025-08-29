import { supabaseAdmin } from '../shared/supabase';
import { User, Transaction, DepositWithdraw } from '../shared/types';

export const db = {
  async getAllUsers(): Promise<User[]> {
    if (!supabaseAdmin) {
      // Fallback to mock data if no database connection
      return [
        {
          id: '1',
          email: 'john@example.com',
          username: 'john_doe',
          phone: 'John',
          country: 'Doe',
          role: 'user',
          status: 'active',
          totalBalance: 1000,
          tradingBalance: 500,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          email: 'jane@example.com',
          username: 'jane_smith',
          phone: 'Jane',
          country: 'Smith',
          role: 'user',
          status: 'suspended',
          totalBalance: 750,
          tradingBalance: 250,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map snake_case to camelCase for frontend compatibility
      return (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.first_name,
        country: user.last_name,
        role: user.role,
        status: user.status,
        totalBalance: parseFloat(user.total_balance || '0'),
        tradingBalance: parseFloat(user.trading_balance || '0'),
        createdAt: new Date(user.created_at),
        updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      }));
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<boolean> {
    if (!supabaseAdmin) {
      console.log(`Mock: User ${userId} status updated to ${status}`);
      return true;
    }

    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Database error:', error);
      return false;
    }
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    if (!supabaseAdmin) {
      return [
        {
          id: '1',
          user_id: userId,
          type: 'trade',
          amount: 100,
          status: 'completed',
          created_at: new Date()
        }
      ];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async getPendingDepositsWithdrawals(): Promise<DepositWithdraw[]> {
    if (!supabaseAdmin) {
      return [
        {
          id: '1',
          user_id: '1',
          type: 'deposit',
          amount: 500,
          status: 'pending',
          created_at: new Date()
        }
      ];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .in('type', ['deposit', 'withdrawal'])
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },

  async updateDepositWithdrawalStatus(id: string, status: string, processedBy?: string, rejectionReason?: string): Promise<boolean> {
    if (!supabaseAdmin) {
      console.log(`Mock: Deposit/Withdrawal ${id} status updated to ${status}`);
      return true;
    }

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (processedBy) updateData.processed_by = processedBy;
      if (rejectionReason) updateData.rejection_reason = rejectionReason;

      const { error } = await supabaseAdmin
        .from('transactions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Database error:', error);
      return false;
    }
  }
};