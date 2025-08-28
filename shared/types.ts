export interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  country?: string;
  password?: string; // For admin dashboard viewing
  role: 'admin' | 'user';
  totalBalance: number;
  tradingBalance: number;
  createdAt: Date;
  updatedAt?: Date;
  status?: 'active' | 'suspended' | 'deleted';
}

export interface TradingPair {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  priceHistory: number[];
}

export interface Transaction {
  id: string;
  userId: string;
  pairId?: string;
  symbol?: string;
  type: 'trade' | 'deposit' | 'withdrawal' | 'balance_adjustment';
  action?: 'buy' | 'sell';
  amount: number;
  price?: number;
  total: number;
  pnl?: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed' | 'won' | 'lost' | 'approved' | 'rejected';
  isTimedTrade?: boolean;
  tradeDuration?: number; // in minutes
  tradeEndTime?: Date;
  prediction?: 'up' | 'down';
  entryPrice?: number;
  exitPrice?: number;
  // New fields for deposits/withdrawals
  cryptoType?: string;
  address?: string;
  txHash?: string;
  confirmations?: number;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, confirmPassword: string, phone?: string, country?: string) => Promise<{ success: boolean; error?: string }>;
  updateUserBalance: (totalBalance: number, tradingBalance: number) => void;
  updateUserProfile: (profileData: Partial<User> & { currentPassword?: string }) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

export interface TradingContextType {
  pairs: TradingPair[];
  transactions: Transaction[];
  selectedPair: TradingPair | null;
  setSelectedPair: (pair: TradingPair | null) => void;
  executeTrade: (pairId: string, action: 'buy' | 'sell', amount: number) => Promise<boolean>;
  executeTimedTrade: (pairId: string, prediction: 'up' | 'down', amount: number, duration: number) => Promise<boolean>;
  convertBalance: (amount: number, from: 'total' | 'trading', to: 'total' | 'trading') => Promise<boolean>;
  createDeposit: (amount: number, cryptoType: string, address: string) => Promise<boolean>;
  createWithdrawal: (amount: number, cryptoType: string, address: string) => Promise<boolean>;
  refreshData: () => void;
}

export interface BalanceConversion {
  id: string;
  userId: string;
  amount: number;
  from: 'total' | 'trading';
  to: 'total' | 'trading';
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export type CryptoType = 'BTC' | 'ETH' | 'USDT' | 'USDC';

export interface CryptoWallet {
  id: string;
  type: CryptoType;
  name: string;
  symbol: string;
  address: string;
  network: string;
  qrCode?: string;
  isActive: boolean;
}

export interface DepositWithdraw {
  id: string;
  userId: string;
  userEmail: string;
  type: 'deposit' | 'withdraw';
  cryptoType: string;
  amount: number;
  usdAmount?: number;
  address: string;
  txHash?: string;
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'failed' | 'cancelled';
  timestamp: Date;
  confirmations?: number;
  requiredConfirmations?: number;
  notes?: string;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'manual_deposit' | 'manual_withdraw' | 'approve_withdraw' | 'reject_withdraw' | 'balance_adjustment';
  targetUserId: string;
  targetUserEmail: string;
  amount?: number;
  cryptoType?: CryptoType;
  reason: string;
  timestamp: Date;
  relatedTransactionId?: string;
}