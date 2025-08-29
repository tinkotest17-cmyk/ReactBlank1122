import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface Trade {
  id: string;
  userId: string;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  created_at: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  cryptoType: string;
  amount: number;
  status: string;
  created_at: string;
}

interface TradingContextType {
  activeTrades: Trade[];
  transactions: Transaction[];
  balance: number;
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'created_at'>) => Promise<void>;
  fetchActiveTrades: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  createDeposit: (amount: number, cryptoType: string) => Promise<void>;
  createWithdrawal: (amount: number, cryptoType: string, walletAddress: string) => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserBalance } = useAuth();
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      setBalance(user.balance);
      fetchActiveTrades();
      fetchTransactions();
    }
  }, [user]);

  const fetchActiveTrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activeTrades')
        .select('*')
        .eq('userId', user.id);

      if (error) {
        console.error('Error fetching active trades:', error);
        // Fallback to localStorage
        const localTrades = JSON.parse(localStorage.getItem(`trades_${user.id}`) || '[]');
        setActiveTrades(localTrades);
      } else {
        setActiveTrades(data || []);
      }
    } catch (error) {
      console.error('Error fetching active trades:', error);
      // Fallback to localStorage
      const localTrades = JSON.parse(localStorage.getItem(`trades_${user.id}`) || '[]');
      setActiveTrades(localTrades);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        // Fallback to localStorage
        const localTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
        setTransactions(localTransactions);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to localStorage
      const localTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
      setTransactions(localTransactions);
    }
  };

  const addTrade = async (trade: Omit<Trade, 'id' | 'userId' | 'created_at'>) => {
    if (!user) return;

    const newTrade: Trade = {
      id: Date.now().toString(),
      userId: user.id,
      ...trade,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('activeTrades')
        .insert([newTrade]);

      if (error) {
        console.error('Error adding trade to Supabase:', error);
        // Fallback to localStorage
        const localTrades = JSON.parse(localStorage.getItem(`trades_${user.id}`) || '[]');
        localTrades.push(newTrade);
        localStorage.setItem(`trades_${user.id}`, JSON.stringify(localTrades));
      }

      // Update local state
      setActiveTrades(prev => [...prev, newTrade]);

      // Create transaction record
      const transaction: Transaction = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'trade',
        cryptoType: trade.pair.split('/')[0],
        amount: trade.amount,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      try {
        const { error: txError } = await supabase
          .from('transactions')
          .insert([transaction]);

        if (txError) {
          console.error('Error updating Supabase transactions:', txError);
          // Fallback to localStorage
          const localTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
          localTransactions.unshift(transaction);
          localStorage.setItem(`transactions_${user.id}`, JSON.stringify(localTransactions));
        }
      } catch (error) {
        console.error('Error updating transactions:', error);
      }

      await fetchTransactions();
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  const createDeposit = async (amount: number, cryptoType: string) => {
    if (!user) return;

    const deposit = {
      id: Date.now().toString(),
      userId: user.id,
      type: 'deposit',
      cryptoType,
      amount,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    try {
      // Try to create in Supabase
      const { error: depositError } = await supabase
        .from('deposits_withdrawals')
        .insert([deposit]);

      if (depositError) {
        console.error('Error creating deposit in Supabase:', depositError);
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert([deposit]);

      if (txError) {
        console.error('Error updating Supabase transactions:', txError);
        // Fallback to localStorage
        const localTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
        localTransactions.unshift(deposit);
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(localTransactions));
      }

      // Update balance
      const newBalance = balance + amount;
      setBalance(newBalance);
      await updateUserBalance(user.id, newBalance);
      await fetchTransactions();
    } catch (error) {
      console.error('Error creating deposit:', error);
    }
  };

  const createWithdrawal = async (amount: number, cryptoType: string, walletAddress: string) => {
    if (!user || amount > balance) return;

    const withdrawal = {
      id: Date.now().toString(),
      userId: user.id,
      type: 'withdraw',
      cryptoType,
      amount,
      status: 'completed',
      wallet_address: walletAddress,
      created_at: new Date().toISOString(),
    };

    try {
      // Try to create in Supabase
      const { error: withdrawError } = await supabase
        .from('deposits_withdrawals')
        .insert([withdrawal]);

      if (withdrawError) {
        console.error('Error creating withdrawal in Supabase:', withdrawError);
      }

      // Create transaction record
      const transaction = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'withdraw',
        cryptoType,
        amount,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      const { error: txError } = await supabase
        .from('transactions')
        .insert([transaction]);

      if (txError) {
        console.error('Error updating Supabase transactions:', txError);
        // Fallback to localStorage
        const localTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
        localTransactions.unshift(transaction);
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(localTransactions));
      }

      // Update balance
      const newBalance = balance - amount;
      setBalance(newBalance);
      await updateUserBalance(user.id, newBalance);
      await fetchTransactions();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!user) return;

    setBalance(newBalance);
    await updateUserBalance(user.id, newBalance);
  };

  return (
    <TradingContext.Provider
      value={{
        activeTrades,
        transactions,
        balance,
        addTrade,
        fetchActiveTrades,
        fetchTransactions,
        createDeposit,
        createWithdrawal,
        updateBalance,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

// Export activateUser function for compatibility
export const activateUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) {
      console.error('Error activating user:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error activating user:', error);
    return false;
  }
};