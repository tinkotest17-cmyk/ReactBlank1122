import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradingPair, Transaction, TradingContextType, User, DepositWithdraw } from '@shared/types';
import { useAuth } from './AuthContext';

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
  const { user, updateUserBalance } = useAuth();

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
      const savedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }

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
              // Trade should have completed, complete it now
              completeTimedTrade(trade.id);
            }
          }
        });
      }
    }
  }, [user]);

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

    // Save to localStorage
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));

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
    localStorage.setItem(`activeTrades_${user.id}`, JSON.stringify(updatedActiveTrades));

    // Set timer for trade completion
    setTimeout(() => {
      completeTimedTrade(transaction.id);
    }, duration * 60 * 1000);

    return true;
  };

  const completeTimedTrade = (tradeId: string) => {
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
    localStorage.setItem(`activeTrades_${user.id}`, JSON.stringify(updatedActiveTrades));

    const updatedTransactions = [...transactions, completedTrade];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
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

    // Store in deposits/withdrawals for admin access
    const existingDepositsWithdrawals = localStorage.getItem('depositsWithdrawals');
    const depositsWithdrawals = existingDepositsWithdrawals ? JSON.parse(existingDepositsWithdrawals) : [];
    depositsWithdrawals.push(depositWithdraw);
    localStorage.setItem('depositsWithdrawals', JSON.stringify(depositsWithdrawals));

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
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));

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

    // Store in deposits/withdrawals for admin access
    const existingDepositsWithdrawals = localStorage.getItem('depositsWithdrawals');
    const depositsWithdrawals = existingDepositsWithdrawals ? JSON.parse(existingDepositsWithdrawals) : [];
    depositsWithdrawals.push(depositWithdraw);
    localStorage.setItem('depositsWithdrawals', JSON.stringify(depositsWithdrawals));

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
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));

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
    window.dispatchEvent(new CustomEvent('refreshBalance'));
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
export function getAllUsers(): User[] {
  const usersData = localStorage.getItem('allUsers');
  if (!usersData) {
    return [];
  }
  return JSON.parse(usersData);
}

export function getAllTransactions(): Transaction[] {
  const users = getAllUsers();
  const allTransactions: Transaction[] = [];
  
  users.forEach(user => {
    const userTransactions = localStorage.getItem(`transactions_${user.id}`);
    if (userTransactions) {
      allTransactions.push(...JSON.parse(userTransactions));
    }
  });
  
  return allTransactions;
}

export function getAllDepositsWithdrawals(): DepositWithdraw[] {
  const depositsWithdrawals = localStorage.getItem('depositsWithdrawals');
  if (!depositsWithdrawals) {
    return [];
  }
  return JSON.parse(depositsWithdrawals);
}

export function approveDepositWithdrawal(transactionId: string, adminId: string, adminEmail: string): boolean {
  try {
    const depositsWithdrawals = getAllDepositsWithdrawals();
    const transactionIndex = depositsWithdrawals.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) return false;
    
    const transaction = depositsWithdrawals[transactionIndex];
    transaction.status = 'approved';
    transaction.processedBy = adminEmail;
    transaction.processedAt = new Date();
    
    // Update the transaction in storage
    localStorage.setItem('depositsWithdrawals', JSON.stringify(depositsWithdrawals));
    
    // Handle balance updates
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === transaction.userId);
    if (userIndex !== -1) {
      if (transaction.type === 'deposit') {
        // Add to user's balance for deposits
        users[userIndex].totalBalance += transaction.amount;
      } else if (transaction.type === 'withdraw') {
        // Deduct from user's balance for withdrawals
        users[userIndex].totalBalance = Math.max(0, users[userIndex].totalBalance - transaction.amount);
      }
      
      localStorage.setItem('allUsers', JSON.stringify(users));
      
      // Update current user if it's the same user
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        if (currentUser.id === transaction.userId) {
          if (transaction.type === 'deposit') {
            currentUser.totalBalance += transaction.amount;
          } else if (transaction.type === 'withdraw') {
            currentUser.totalBalance = Math.max(0, currentUser.totalBalance - transaction.amount);
          }
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error approving transaction:', error);
    return false;
  }
}

export function rejectDepositWithdrawal(transactionId: string, adminId: string, adminEmail: string, reason: string): boolean {
  try {
    const depositsWithdrawals = getAllDepositsWithdrawals();
    const transactionIndex = depositsWithdrawals.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) return false;
    
    const transaction = depositsWithdrawals[transactionIndex];
    transaction.status = 'rejected';
    transaction.processedBy = adminEmail;
    transaction.processedAt = new Date();
    transaction.rejectionReason = reason;
    
    // Update the transaction in storage
    localStorage.setItem('depositsWithdrawals', JSON.stringify(depositsWithdrawals));
    
    return true;
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    return false;
  }
}

export function suspendUser(userId: string, adminId: string, adminEmail: string): boolean {
  try {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex].status = 'suspended';
    localStorage.setItem('allUsers', JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === userId) {
        currentUser.status = 'suspended';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error suspending user:', error);
    return false;
  }
}

export function activateUser(userId: string, adminId: string, adminEmail: string): boolean {
  try {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex].status = 'active';
    localStorage.setItem('allUsers', JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === userId) {
        currentUser.status = 'active';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error activating user:', error);
    return false;
  }
}

export function adjustUserBalance(userId: string, newTotalBalance: number, newTradingBalance: number, adminId: string, adminEmail: string, reason: string): boolean {
  try {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    const oldTotalBalance = users[userIndex].totalBalance;
    const oldTradingBalance = users[userIndex].tradingBalance;
    
    users[userIndex].totalBalance = newTotalBalance;
    users[userIndex].tradingBalance = newTradingBalance;
    localStorage.setItem('allUsers', JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === userId) {
        currentUser.totalBalance = newTotalBalance;
        currentUser.tradingBalance = newTradingBalance;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
    
    // Log the balance adjustment
    const balanceLog = {
      id: Date.now().toString(),
      userId,
      adminId,
      adminEmail,
      oldTotalBalance,
      oldTradingBalance,
      newTotalBalance,
      newTradingBalance,
      reason,
      timestamp: new Date()
    };
    
    const existingLogs = localStorage.getItem('balanceAdjustmentLogs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(balanceLog);
    localStorage.setItem('balanceAdjustmentLogs', JSON.stringify(logs));
    
    return true;
  } catch (error) {
    console.error('Error adjusting user balance:', error);
    return false;
  }
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}