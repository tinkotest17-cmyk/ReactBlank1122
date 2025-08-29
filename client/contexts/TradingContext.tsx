import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradingPair, Transaction, TradingContextType, User, DepositWithdraw } from '@shared/types';
import { useAuth } from './AuthContext';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/supabase'; // Assuming you have types generated

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Make sure to set them in your .env file.');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const TradingContext = createContext<TradingContextType | undefined>(undefined);

// Generate mock price history
const generatePriceHistory = (basePrice: number): number[] => {
  const history = [];
  let currentPrice = basePrice;

  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * 0.02;
    currentPrice = currentPrice * (1 + change);
    history.push(Number(currentPrice.toFixed(6)));
  }

  return history;
};

// Mock trading pairs
const MOCK_TRADING_PAIRS: TradingPair[] = [
  {
    id: '1',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    price: 1.0842,
    change24h: 0.12,
    volume24h: 1250000,
    priceHistory: generatePriceHistory(1.0842)
  },
  {
    id: '2',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    price: 1.2635,
    change24h: -0.08,
    volume24h: 980000,
    priceHistory: generatePriceHistory(1.2635)
  },
  {
    id: '3',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    price: 149.85,
    change24h: 0.25,
    volume24h: 1800000,
    priceHistory: generatePriceHistory(149.85)
  },
  {
    id: '4',
    symbol: 'BTC/USDT',
    name: 'Bitcoin / Tether',
    price: 43285.67,
    change24h: 2.15,
    volume24h: 2500000,
    priceHistory: generatePriceHistory(43285.67)
  },
  {
    id: '5',
    symbol: 'ETH/USDT',
    name: 'Ethereum / Tether',
    price: 2645.89,
    change24h: 1.89,
    volume24h: 1900000,
    priceHistory: generatePriceHistory(2645.89)
  },
  {
    id: '6',
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    price: 0.6589,
    change24h: -0.15,
    volume24h: 750000,
    priceHistory: generatePriceHistory(0.6589)
  },
  {
    id: '7',
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    price: 1.3485,
    change24h: 0.09,
    volume24h: 650000,
    priceHistory: generatePriceHistory(1.3485)
  },
  {
    id: '8',
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    price: 0.8756,
    change24h: -0.06,
    volume24h: 520000,
    priceHistory: generatePriceHistory(0.8756)
  },
  {
    id: '9',
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar',
    price: 2045.85,
    change24h: 0.45,
    volume24h: 1100000,
    priceHistory: generatePriceHistory(2045.85)
  },
  {
    id: '10',
    symbol: 'ADA/USDT',
    name: 'Cardano / Tether',
    price: 0.4567,
    change24h: 3.25,
    volume24h: 850000,
    priceHistory: generatePriceHistory(0.4567)
  },
  {
    id: '11',
    symbol: 'DOT/USDT',
    name: 'Polkadot / Tether',
    price: 7.89,
    change24h: -1.45,
    volume24h: 720000,
    priceHistory: generatePriceHistory(7.89)
  },
  {
    id: '12',
    symbol: 'LINK/USDT',
    name: 'Chainlink / Tether',
    price: 14.67,
    change24h: 0.89,
    volume24h: 680000,
    priceHistory: generatePriceHistory(14.67)
  },
  {
    id: '13',
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    price: 0.6189,
    change24h: -0.18,
    volume24h: 420000,
    priceHistory: generatePriceHistory(0.6189)
  },
  {
    id: '14',
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    price: 0.8567,
    change24h: 0.11,
    volume24h: 580000,
    priceHistory: generatePriceHistory(0.8567)
  },
  {
    id: '15',
    symbol: 'SOL/USDT',
    name: 'Solana / Tether',
    price: 98.45,
    change24h: 4.67,
    volume24h: 1200000,
    priceHistory: generatePriceHistory(98.45)
  },
  {
    id: '16',
    symbol: 'MATIC/USDT',
    name: 'Polygon / Tether',
    price: 0.8945,
    change24h: 2.34,
    volume24h: 690000,
    priceHistory: generatePriceHistory(0.8945)
  },
  {
    id: '17',
    symbol: 'AVAX/USDT',
    name: 'Avalanche / Tether',
    price: 36.78,
    change24h: -0.89,
    volume24h: 540000,
    priceHistory: generatePriceHistory(36.78)
  },
  {
    id: '18',
    symbol: 'LTC/USDT',
    name: 'Litecoin / Tether',
    price: 72.45,
    change24h: 1.23,
    volume24h: 450000,
    priceHistory: generatePriceHistory(72.45)
  },
  {
    id: '19',
    symbol: 'EUR/JPY',
    name: 'Euro / Japanese Yen',
    price: 162.45,
    change24h: 0.34,
    volume24h: 780000,
    priceHistory: generatePriceHistory(162.45)
  },
  {
    id: '20',
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    price: 189.67,
    change24h: -0.12,
    volume24h: 620000,
    priceHistory: generatePriceHistory(189.67)
  }
];

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [pairs, setPairs] = useState<TradingPair[]>(MOCK_TRADING_PAIRS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [activeTrades, setActiveTrades] = useState<Transaction[]>([]);
  const { user, updateUserBalance, fetchUserBalance } = useAuth();

  // Simulate price updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prevPairs => 
        prevPairs.map(pair => {
          const change = (Math.random() - 0.5) * 0.01;
          const newPrice = pair.price * (1 + change);
          return {
            ...pair,
            price: Number(newPrice.toFixed(pair.symbol.includes('JPY') ? 2 : 4)),
            change24h: Number((pair.change24h + change * 100).toFixed(2))
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load transactions and active trades from localStorage
  useEffect(() => {
    if (user) {
      // Fetch from Supabase instead of localStorage
      const fetchUserTransactions = async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('userId', user.id);

        if (error) {
          console.error('Error fetching transactions:', error);
          // Fallback to localStorage if Supabase fails or for testing without backend
          const savedTransactions = localStorage.getItem(`transactions_${user.id}`);
          if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
          }
        } else if (data) {
          setTransactions(data as Transaction[]);
        }
      };

      const fetchUserActiveTrades = async () => {
        const { data, error } = await supabase
          .from('activeTrades')
          .select('*')
          .eq('userId', user.id);

        if (error) {
          console.error('Error fetching active trades:', error);
          // Fallback to localStorage
          const savedActiveTrades = localStorage.getItem(`activeTrades_${user.id}`);
          if (savedActiveTrades) {
            const trades = JSON.parse(savedActiveTrades);
            setActiveTrades(trades);
            // Restart timers for active trades
            trades.forEach((trade: Transaction) => {
              if (trade.tradeEndTime) {
                const endTime = new Date(trade.tradeEndTime).getTime();
                const now = Date.now();
                const remaining = endTime - now;

                if (remaining > 0) {
                  setTimeout(() => {
                    completeTimedTrade(trade.id);
                  }, remaining);
                } else {
                  completeTimedTrade(trade.id);
                }
              }
            });
          }
        } else if (data) {
          const trades = data as Transaction[];
          setActiveTrades(trades);
          // Restart timers for active trades
          trades.forEach((trade: Transaction) => {
            if (trade.tradeEndTime) {
              const endTime = new Date(trade.tradeEndTime).getTime();
              const now = Date.now();
              const remaining = endTime - now;

              if (remaining > 0) {
                setTimeout(() => {
                  completeTimedTrade(trade.id);
                }, remaining);
              } else {
                completeTimedTrade(trade.id);
              }
            }
          });
        }
      };

      fetchUserTransactions();
      fetchUserActiveTrades();
    }
  }, [user]);

  // Function to update Supabase transactions and localStorage
  const updateSupabaseTransactions = async (newTransactions: Transaction[]) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .upsert(newTransactions.filter(t => t.userId === user.id))
        .eq('userId', user.id);

      if (error) console.error('Error updating Supabase transactions:', error);
    } finally {
      // Always update localStorage as a fallback or for offline support
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(newTransactions));
    }
  };

  // Function to update Supabase active trades and localStorage
  const updateSupabaseActiveTrades = async (newActiveTrades: Transaction[]) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('activeTrades')
        .upsert(newActiveTrades.filter(t => t.userId === user.id))
        .eq('userId', user.id);

      if (error) console.error('Error updating Supabase active trades:', error);
    } finally {
      // Always update localStorage as a fallback or for offline support
      localStorage.setItem(`activeTrades_${user.id}`, JSON.stringify(newActiveTrades));
    }
  };


  const executeTrade = async (pairId: string, action: 'buy' | 'sell', amount: number): Promise<boolean> => {
    if (!user) return false;

    const pair = pairs.find(p => p.id === pairId);
    if (!pair) return false;

    const total = amount * pair.price;

    // Check if user has sufficient balance
    if (total > user.tradingBalance) {
      return false;
    }

    // Create transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      pairId: pair.id,
      symbol: pair.symbol,
      type: 'trade',
      action,
      amount,
      price: pair.price,
      total,
      timestamp: new Date(),
      status: 'completed'
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    updateSupabaseTransactions(updatedTransactions);


    // Update user balance through AuthContext
    updateUserBalance(user.totalBalance, user.tradingBalance - total);

    return true;
  };

  const executeTimedTrade = async (pairId: string, prediction: 'up' | 'down', amount: number, duration: number): Promise<boolean> => {
    if (!user) return false;

    const pair = pairs.find(p => p.id === pairId);
    if (!pair) return false;

    // Check if user has sufficient balance
    if (amount > user.tradingBalance) {
      return false;
    }

    const tradeEndTime = new Date(Date.now() + duration * 60 * 1000);

    // Create timed transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      pairId: pair.id,
      symbol: pair.symbol,
      type: 'trade',
      action: prediction === 'up' ? 'buy' : 'sell',
      amount: 1, // For timed trades, amount represents units
      price: pair.price,
      total: amount, // The invested amount
      timestamp: new Date(),
      status: 'pending',
      isTimedTrade: true,
      tradeDuration: duration,
      tradeEndTime,
      prediction,
      entryPrice: pair.price
    };

    // Deduct balance immediately through AuthContext
    updateUserBalance(user.totalBalance, user.tradingBalance - amount);

    // Add to active trades
    const updatedActiveTrades = [...activeTrades, transaction];
    setActiveTrades(updatedActiveTrades);
    updateSupabaseActiveTrades(updatedActiveTrades);

    // Set timer for trade completion
    setTimeout(() => {
      completeTimedTrade(transaction.id);
    }, duration * 60 * 1000);

    return true;
  };

  const completeTimedTrade = async (tradeId: string) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade || !user) return;

    const pair = pairs.find(p => p.id === trade.pairId);
    if (!pair) return;

    // Simulate 1:4 win ratio (25% chance to win)
    const isWin = Math.random() < 0.25;

    const completedTrade: Transaction = {
      ...trade,
      status: isWin ? 'won' : 'lost',
      exitPrice: pair.price,
      pnl: isWin ? trade.total * 0.85 : -trade.total // 85% payout for wins
    };

    // Update user balance if win
    if (isWin && user) {
      const winnings = trade.total + (trade.total * 0.85); // Return investment + 85% profit
      updateUserBalance(user.totalBalance, user.tradingBalance + winnings);
    }

    // Move from active trades to completed transactions
    const updatedActiveTrades = activeTrades.filter(t => t.id !== tradeId);
    setActiveTrades(updatedActiveTrades);
    updateSupabaseActiveTrades(updatedActiveTrades);

    const updatedTransactions = [...transactions, completedTrade];
    setTransactions(updatedTransactions);
    updateSupabaseTransactions(updatedTransactions);
  };

  const convertBalance = async (amount: number, from: 'total' | 'trading', to: 'total' | 'trading'): Promise<boolean> => {
    if (!user) return false;

    const sourceBalance = from === 'total' ? user.totalBalance : user.tradingBalance;

    if (amount > sourceBalance) {
      return false;
    }

    // Update balances through AuthContext
    const newTotalBalance = from === 'total'
      ? user.totalBalance - amount
      : user.totalBalance + amount;
    const newTradingBalance = from === 'trading'
      ? user.tradingBalance - amount
      : user.tradingBalance + amount;

    updateUserBalance(newTotalBalance, newTradingBalance);
    // TODO: Add Supabase integration for balance updates
    return true;
  };

  const createDeposit = async (amount: number, cryptoType: string, address: string): Promise<boolean> => {
    if (!user) return false;

    const depositWithdraw: DepositWithdraw = {
      id: Date.now().toString(),
      userId: user.id,
      userEmail: user.email,
      type: 'deposit',
      amount,
      cryptoType,
      address,
      timestamp: new Date(),
      status: 'pending'
    };

    // Store in Supabase deposits/withdrawals for admin access
    try {
      const { error } = await supabase.from('deposits_withdrawals').insert([depositWithdraw]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating deposit in Supabase:', error);
      // Fallback to localStorage
      const existingDepositsWithdrawals = localStorage.getItem('depositsWithdrawals');
      const depositsWithdrawals = existingDepositsWithdrawals ? JSON.parse(existingDepositsWithdrawals) : [];
      depositsWithdrawals.push(depositWithdraw);
      localStorage.setItem('depositsWithdrawals', JSON.stringify(depositsWithdrawals));
    }


    // Also store as a transaction for user history
    const transaction: Transaction = {
      id: depositWithdraw.id,
      userId: user.id,
      type: 'deposit',
      amount,
      total: amount,
      timestamp: new Date(),
      status: 'pending',
      cryptoType,
      address
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    updateSupabaseTransactions(updatedTransactions);

    return true;
  };

  const createWithdrawal = async (amount: number, cryptoType: string, address: string): Promise<boolean> => {
    if (!user) return false;

    if (amount > user.totalBalance) {
      return false;
    }

    const depositWithdraw: DepositWithdraw = {
      id: Date.now().toString(),
      userId: user.id,
      userEmail: user.email,
      type: 'withdraw',
      amount,
      cryptoType,
      address,
      timestamp: new Date(),
      status: 'pending'
    };

    // Store in Supabase deposits/withdrawals for admin access
    try {
      const { error } = await supabase.from('deposits_withdrawals').insert([depositWithdraw]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating withdrawal in Supabase:', error);
      // Fallback to localStorage
      const existingDepositsWithdrawals = localStorage.getItem('depositsWithdrawals');
      const depositsWithdrawals = existingDepositsWithdrawals ? JSON.parse(existingDepositsWithdrawals) : [];
      depositsWithdrawals.push(depositWithdraw);
      localStorage.setItem('depositsWithdrawals', JSON.stringify(depositsWithdrawals));
    }


    // Also store as a transaction for user history
    const transaction: Transaction = {
      id: depositWithdraw.id,
      userId: user.id,
      type: 'withdrawal',
      amount,
      total: amount,
      timestamp: new Date(),
      status: 'pending',
      cryptoType,
      address
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    updateSupabaseTransactions(updatedTransactions);

    return true;
  };

  const refreshData = () => {
    // Simulate refreshing trading pairs with updated prices
    const updatedPairs = MOCK_TRADING_PAIRS.map(pair => ({
      ...pair,
      price: pair.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% price change
      change24h: (Math.random() - 0.5) * 4, // Random 24h change ±2%
      priceHistory: [...pair.priceHistory, pair.price * (1 + (Math.random() - 0.5) * 0.01)]
    }));

    setPairs(updatedPairs);

    // Trigger balance refresh in AuthContext
    fetchUserBalance(); // Ensure user balance is up-to-date
    window.dispatchEvent(new CustomEvent('refreshBalance'));
  };

  // Helper to get audit logs from Supabase or localStorage
  const getAuditLogs = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('auditLogs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs from Supabase:', error);
      // Fallback to localStorage
      const logs = localStorage.getItem('adminLogs');
      return logs ? JSON.parse(logs) : [];
    }
  };

  // Helper to save audit logs to Supabase or localStorage
  const saveAuditLog = async (logEntry: any) => {
    try {
      const { error } = await supabase.from('auditLogs').insert([logEntry]);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving audit log to Supabase:', error);
      // Fallback to localStorage
      const logs = localStorage.getItem('adminLogs') ? JSON.parse(localStorage.getItem('adminLogs')!) : [];
      logs.push(logEntry);
      localStorage.setItem('adminLogs', JSON.stringify(logs));
    }
  };


  return (
    <TradingContext.Provider value={{
      pairs,
      transactions: [...transactions, ...activeTrades],
      selectedPair,
      setSelectedPair,
      executeTrade,
      executeTimedTrade,
      convertBalance,
      createDeposit,
      createWithdrawal,
      refreshData
    }}>
      {children}
    </TradingContext.Provider>
  );
}

// Admin functions - exported separately for admin use

// Fetch all users from Supabase
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    // Fallback to localStorage for testing or if Supabase is unavailable
    const usersData = localStorage.getItem('allUsers');
    return usersData ? JSON.parse(usersData) : [];
  }
}

// Fetch all transactions from Supabase
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw error;
    return data as Transaction[];
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    // Fallback to localStorage
    const users = await getAllUsers(); // Get users to iterate through their transaction keys
    const allTransactions: Transaction[] = [];
    users.forEach(user => {
      const userTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (userTransactions) {
        allTransactions.push(...JSON.parse(userTransactions));
      }
    });
    return allTransactions;
  }
}

// Fetch all deposits/withdrawals from Supabase
export async function getAllDepositsWithdrawals(): Promise<DepositWithdraw[]> {
  try {
    const { data, error } = await supabase.from('deposits_withdrawals').select('*');
    if (error) throw error;
    return data as DepositWithdraw[];
  } catch (error) {
    console.error('Error fetching all deposits/withdrawals:', error);
    // Fallback to localStorage
    const depositsWithdrawals = localStorage.getItem('depositsWithdrawals');
    return depositsWithdrawals ? JSON.parse(depositsWithdrawals) : [];
  }
}

export const approveDepositWithdrawal = async (transactionId: string, adminId: string, adminEmail: string): Promise<boolean> => {
  try {
    // Fetch the transaction from Supabase
    const { data: transaction, error: fetchError } = await supabase
      .from('deposits_withdrawals')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      console.error('Error fetching transaction for approval:', fetchError);
      return false;
    }

    // Update transaction status and admin details
    const { error: updateError } = await supabase
      .from('deposits_withdrawals')
      .update({
        status: 'approved',
        processedBy: adminEmail,
        processedAt: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    // Handle balance updates in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, totalBalance, tradingBalance')
      .eq('id', transaction.userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user for balance update:', userError);
      return false;
    }

    let newTotalBalance = user.totalBalance;
    if (transaction.type === 'deposit') {
      newTotalBalance += transaction.amount;
    } else if (transaction.type === 'withdraw') {
      newTotalBalance = Math.max(0, user.totalBalance - transaction.amount);
    }

    const { error: balanceUpdateError } = await supabase
      .from('users')
      .update({ totalBalance: newTotalBalance })
      .eq('id', transaction.userId);

    if (balanceUpdateError) throw balanceUpdateError;

    // Log the admin action
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'Deposit/Withdrawal Approved',
      adminId,
      adminEmail,
      details: `Transaction ${transactionId} (${transaction.type}) approved for user ${transaction.userId}`,
      targetUserId: transaction.userId,
      transactionId: transactionId,
    };
    await saveAuditLog(logEntry);

    // Dispatch event for UI updates if needed (e.g., refresh user profile)
    window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { userId: transaction.userId, newBalance: newTotalBalance } }));

    return true;
  } catch (error) {
    console.error('Error approving transaction:', error);
    return false;
  }
};

export const rejectDepositWithdrawal = async (transactionId: string, adminId: string, adminEmail: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('deposits_withdrawals')
      .update({
        status: 'rejected',
        processedBy: adminEmail,
        processedAt: new Date().toISOString(),
        rejectionReason: reason,
      })
      .eq('id', transactionId);

    if (error) throw error;

    // Log the admin action
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'Deposit/Withdrawal Rejected',
      adminId,
      adminEmail,
      details: `Transaction ${transactionId} rejected for user with reason: ${reason}`,
      targetUserId: await (async () => {
        const { data: transaction } = await supabase.from('deposits_withdrawals').select('userId').eq('id', transactionId).single();
        return transaction?.userId;
      })(),
      transactionId: transactionId,
    };
    await saveAuditLog(logEntry);

    return true;
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    return false;
  }
};

// Helper function to get audit logs (used by suspend/activateUser)
async function getAuditLogs(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('auditLogs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    const logs = localStorage.getItem('adminLogs');
    return logs ? JSON.parse(logs) : [];
  }
}

export const suspendUser = async (userId: string, adminId: string, adminEmail: string): Promise<boolean> => {
  try {
    const users = await getAllUsers(); // Fetch users from Supabase
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      console.error('User not found for suspension.');
      return false;
    }

    // Update user status in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        status: 'suspended',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'User suspended',
      adminId,
      adminEmail,
      details: `User ${users[userIndex].email} suspended by admin`,
      targetUserId: userId,
    };
    await saveAuditLog(logEntry); // Save log using the helper

    // Update current user if they're the one being suspended
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.id === userId) {
        const updatedUserData = {
          ...userData,
          status: 'suspended',
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));

        // Trigger a refresh event for other components
        window.dispatchEvent(new CustomEvent('userStatusChanged', {
          detail: { user: updatedUserData, action: 'suspended' }
        }));
      }
    }

    // Trigger a refresh event for admin panel
    window.dispatchEvent(new CustomEvent('refreshAdminData'));

    return true;
  } catch (error) {
    console.error('Error suspending user:', error);
    return false;
  }
};

export const activateUser = async (userId: string, adminId: string, adminEmail: string): Promise<boolean> => {
  try {
    const users = await getAllUsers(); // Fetch users from Supabase
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      console.error('User not found for activation.');
      return false;
    }

    // Update user status in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        status: 'active',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'User activated',
      adminId,
      adminEmail,
      details: `User ${users[userIndex].email} activated by admin`,
      targetUserId: userId,
    };
    await saveAuditLog(logEntry); // Save log using the helper

    // Update current user if they're the one being activated
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.id === userId) {
        const updatedUserData = {
          ...userData,
          status: 'active',
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));

        // Trigger a refresh event for other components
        window.dispatchEvent(new CustomEvent('userStatusChanged', {
          detail: { user: updatedUserData, action: 'activated' }
        }));
      }
    }

    // Trigger a refresh event for admin panel
    window.dispatchEvent(new CustomEvent('refreshAdminData'));

    return true;
  } catch (error) {
    console.error('Error activating user:', error);
    return false;
  }
};

export const adjustUserBalance = async (userId: string, newTotalBalance: number, newTradingBalance: number, adminId: string, adminEmail: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        totalBalance: newTotalBalance,
        tradingBalance: newTradingBalance,
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the balance adjustment
    const balanceLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'User balance adjusted',
      adminId,
      adminEmail,
      details: `Balance adjusted for user ${userId}. Reason: ${reason}`,
      targetUserId: userId,
      oldTotalBalance: (await supabase.from('users').select('totalBalance').eq('id', userId).single()).data?.totalBalance,
      oldTradingBalance: (await supabase.from('users').select('tradingBalance').eq('id', userId).single()).data?.tradingBalance,
      newTotalBalance,
      newTradingBalance,
    };
    await saveAuditLog(balanceLog);

    // Update current user if it's the same user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.id === userId) {
        const updatedUserData = {
          ...userData,
          totalBalance: newTotalBalance,
          tradingBalance: newTradingBalance,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { userId: userId, newBalance: newTotalBalance } }));
      }
    }

    return true;
  } catch (error) {
    console.error('Error adjusting user balance:', error);
    return false;
  }
};

export function useTrading() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}