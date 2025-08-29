
import { supabaseAdmin, getDatabase } from '../shared/supabase';
import { User, Transaction, DepositWithdraw } from '../shared/types';

export class DatabaseService {
  private db: any;
  private supabase: any;

  constructor() {
    this.db = getDatabase();
    this.supabase = supabaseAdmin;
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .insert([{
            email: userData.email,
            username: userData.username,
            role: userData.role || 'user',
            total_balance: userData.totalBalance || 10000,
            trading_balance: userData.tradingBalance || 5000,
            status: 'active'
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<boolean> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('users')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  async updateUserBalance(userId: string, totalBalance: number, tradingBalance: number): Promise<boolean> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('users')
          .update({
            total_balance: totalBalance,
            trading_balance: tradingBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return false;
    }
  }

  // Transaction operations
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction | null> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('transactions')
          .insert([{
            user_id: transactionData.userId,
            type: transactionData.type,
            status: transactionData.status,
            amount: transactionData.amount,
            total: transactionData.total,
            symbol: transactionData.symbol,
            action: transactionData.action
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Deposit/Withdrawal operations
  async createDepositWithdrawal(data: Partial<DepositWithdraw>): Promise<DepositWithdraw | null> {
    try {
      if (this.supabase) {
        const { data: result, error } = await this.supabase
          .from('deposits_withdrawals')
          .insert([{
            user_id: data.userId,
            user_email: data.userEmail,
            type: data.type,
            crypto_type: data.cryptoType,
            amount: data.amount,
            address: data.address,
            status: 'pending'
          }])
          .select()
          .single();

        if (error) throw error;
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error creating deposit/withdrawal:', error);
      return null;
    }
  }

  async getPendingDepositsWithdrawals(): Promise<DepositWithdraw[]> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('deposits_withdrawals')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }
  }

  async updateDepositWithdrawalStatus(
    transactionId: string, 
    status: string, 
    processedBy: string,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('deposits_withdrawals')
          .update({
            status: status,
            processed_by: processedBy,
            processed_at: new Date().toISOString(),
            rejection_reason: rejectionReason || null
          })
          .eq('id', transactionId);

        if (error) throw error;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating deposit/withdrawal status:', error);
      return false;
    }
  }

  // Admin audit log
  async createAuditLog(adminId: string, adminEmail: string, action: string, details: string, targetUserId?: string): Promise<void> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('audit_logs')
          .insert([{
            admin_id: adminId,
            admin_email: adminEmail,
            action: action,
            target_user_id: targetUserId || null,
            details: details
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }
}

export const db = new DatabaseService();
