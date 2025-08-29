
import { getDatabase } from '../shared/supabase';
import { User, Transaction, TradingTransaction, DepositWithdraw } from '../shared/types';

export class DatabaseService {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const query = `
        INSERT INTO users (email, username, role, total_balance, trading_balance)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await this.db.query(query, [
        userData.email,
        userData.username,
        userData.role || 'user',
        userData.totalBalance || 10000,
        userData.tradingBalance || 5000
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await this.db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const query = 'SELECT * FROM users ORDER BY created_at DESC';
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<boolean> {
    try {
      const query = 'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2';
      await this.db.query(query, [status, userId]);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  async updateUserBalance(userId: string, totalBalance: number, tradingBalance: number): Promise<boolean> {
    try {
      const query = `
        UPDATE users 
        SET total_balance = $1, trading_balance = $2, updated_at = NOW() 
        WHERE id = $3
      `;
      await this.db.query(query, [totalBalance, tradingBalance, userId]);
      return true;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return false;
    }
  }

  // Transaction operations
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const query = `
        INSERT INTO transactions (user_id, type, status, amount, balance_before, balance_after, description, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const result = await this.db.query(query, [
        transactionData.userId,
        transactionData.type,
        transactionData.status,
        transactionData.amount,
        transactionData.balanceBefore,
        transactionData.balanceAfter,
        transactionData.description,
        JSON.stringify(transactionData.metadata || {})
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const query = `
        SELECT * FROM transactions 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await this.db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Deposit/Withdrawal operations
  async createDepositWithdrawal(data: Partial<DepositWithdraw>): Promise<DepositWithdraw | null> {
    try {
      const query = `
        INSERT INTO deposit_withdrawals (user_id, user_email, type, crypto_type, amount, address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await this.db.query(query, [
        data.userId,
        data.userEmail,
        data.type,
        data.cryptoType,
        data.amount,
        data.address,
        'pending'
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating deposit/withdrawal:', error);
      return null;
    }
  }

  async getPendingDepositsWithdrawals(): Promise<DepositWithdraw[]> {
    try {
      const query = `
        SELECT * FROM deposit_withdrawals 
        WHERE status = 'pending' 
        ORDER BY created_at DESC
      `;
      const result = await this.db.query(query);
      return result.rows;
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
      const query = `
        UPDATE deposit_withdrawals 
        SET status = $1, processed_by = $2, processed_at = NOW(), rejection_reason = $3
        WHERE id = $4
      `;
      await this.db.query(query, [status, processedBy, rejectionReason || null, transactionId]);
      return true;
    } catch (error) {
      console.error('Error updating deposit/withdrawal status:', error);
      return false;
    }
  }

  // Admin audit log
  async createAuditLog(adminId: string, adminEmail: string, action: string, details: string, targetUserId?: string): Promise<void> {
    try {
      const query = `
        INSERT INTO admin_audit_log (admin_id, admin_email, action, target_user_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await this.db.query(query, [adminId, adminEmail, action, targetUserId || null, details]);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }
}

export const dbService = new DatabaseService();
