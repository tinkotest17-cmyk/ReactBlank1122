// Database schema for EdgeMarket Trading Platform
// This file will be used when integrating with Supabase/PostgreSQL

// Type definitions for database schema
export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type TransactionType = 'trade' | 'deposit' | 'withdrawal' | 'balance_adjustment';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'won' | 'lost' | 'approved' | 'rejected';
export type TradeAction = 'buy' | 'sell';
export type TradePrediction = 'up' | 'down';

// Database table interfaces for when integrating with Supabase/PostgreSQL

export interface DatabaseUser {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  role: UserRole;
  status: UserStatus;
  total_balance: number;
  trading_balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseTransaction {
  id: string;
  user_id: string;
  pair_id?: string;
  symbol?: string;
  type: TransactionType;
  action?: TradeAction;
  amount: number;
  price?: number;
  total: number;
  pnl?: number;
  status: TransactionStatus;
  
  // Timed trade fields
  is_timed_trade?: boolean;
  trade_duration?: number; // in minutes
  trade_end_time?: Date;
  prediction?: TradePrediction;
  entry_price?: number;
  exit_price?: number;
  
  // Deposit/Withdrawal fields
  crypto_type?: string;
  address?: string;
  tx_hash?: string;
  confirmations?: number;
  
  // Admin fields
  admin_notes?: string;
  processed_by?: string;
  processed_at?: Date;
  
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseTradingPair {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabasePriceHistory {
  id: string;
  pair_id: string;
  price: number;
  timestamp: Date;
}

export interface DatabaseAdminAction {
  id: string;
  admin_id: string;
  target_user_id?: string;
  action: string;
  details?: string;
  created_at: Date;
}