import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@shared/types';
import { supabase } from '@shared/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize users in localStorage if not exists
const initializeUsers = () => {
  const existingUsers = localStorage.getItem('allUsers');
  if (!existingUsers) {
    const MOCK_USERS: User[] = [
      {
        id: '1',
        email: 'admin@trading.com',
        username: 'admin',
        phone: '+1-555-0001',
        country: 'United States',
        password: 'admin123',
        role: 'admin',
        totalBalance: 100000,
        tradingBalance: 25000,
        createdAt: new Date('2024-01-01'),
        status: 'active'
      },
      {
        id: '2',
        email: 'user@trading.com',
        username: 'user',
        phone: '+1-555-0002',
        country: 'Canada',
        password: 'user123',
        role: 'user',
        totalBalance: 10000,
        tradingBalance: 5000,
        createdAt: new Date('2024-01-15'),
        status: 'active'
      },
      {
        id: '3',
        email: 'trader@example.com',
        username: 'trader',
        phone: '+44-20-7946-0958',
        country: 'United Kingdom',
        password: 'password123',
        role: 'user',
        totalBalance: 7500,
        tradingBalance: 3000,
        createdAt: new Date('2024-02-01'),
        status: 'active'
      }
    ];
    localStorage.setItem('allUsers', JSON.stringify(MOCK_USERS));
  }
};

// Initialize users on load
initializeUsers();

const getAllUsers = (): User[] => {
  const users = localStorage.getItem('allUsers');
  return users ? JSON.parse(users) : [];
};

// Mock passwords (in real app, this would be handled by backend)
const MOCK_CREDENTIALS = {
  'admin@trading.com': 'admin123',
  'user@trading.com': 'user123',
  'trader@example.com': 'password123'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }

    // Listen for balance refresh events from other components
    const handleRefreshBalance = () => {
      refreshBalance();
    };

    window.addEventListener('refreshBalance', handleRefreshBalance);

    return () => {
      window.removeEventListener('refreshBalance', handleRefreshBalance);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try Supabase login
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!error && data) {
      // Verify password (Supabase won't return the password, so this part is tricky without a dedicated auth flow)
      // For mock purposes, we'll assume a successful Supabase fetch means the user exists and password check is handled elsewhere or implicitly.
      // In a real app, you'd use Supabase Auth or a password verification step.
      // For now, we'll proceed if Supabase returns data.
      if (data.password === password) { // This is a placeholder, Supabase should not expose password
        // Map snake_case to camelCase for frontend compatibility
        const user = {
          id: data.id,
          email: data.email,
          username: data.username,
          phone: data.first_name, // Assuming first_name maps to phone
          country: data.last_name, // Assuming last_name maps to country
          role: data.role,
          status: data.status,
          totalBalance: parseFloat(data.total_balance || '0'),
          tradingBalance: parseFloat(data.trading_balance || '0'),
          createdAt: new Date(data.created_at),
          updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        };
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      } else {
        return false; // Password mismatch
      }
    }

    // Fallback to mock credentials if Supabase login fails or for initial setup
    const expectedPassword = MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS];
    if (!expectedPassword || expectedPassword !== password) {
      return false;
    }

    const allUsers = getAllUsers();
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, confirmPassword: string, phone?: string, country?: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validation
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists in localStorage (fallback)
    const allUsersLocalStorage = getAllUsers();
    if (allUsersLocalStorage.find(u => u.email === email)) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Try to create user in Supabase
    try {
      const userData = {
        email,
        username: email.split('@')[0],
        role: 'user' as const,
        total_balance: 10000,
        trading_balance: 5000,
        first_name: phone || '', // Mapping phone to first_name
        last_name: country || '', // Mapping country to last_name
        status: 'active' as const,
        created_at: new Date().toISOString(), // Add created_at
      };

      const { data, error } = await supabase.from('users').insert([userData]).select().single();

      if (error) {
        console.error('Supabase signup error:', error);
        // Fallback to localStorage if Supabase fails
        const newUser: User = {
          id: Date.now().toString(),
          email,
          username: email.split('@')[0],
          role: 'user' as const,
          totalBalance: 10000,
          tradingBalance: 5000,
          phone,
          country,
          status: 'active' as const,
          createdAt: new Date(),
        };
        const updatedUsers = [...allUsersLocalStorage, newUser];
        localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true };
      } else if (data) {
        // Map Supabase response to User type
        const newUser: User = {
          id: data.id,
          email: data.email,
          username: data.username,
          phone: data.first_name, // Map from first_name
          country: data.last_name, // Map from last_name
          role: data.role,
          status: data.status,
          totalBalance: parseFloat(data.total_balance || '0'),
          tradingBalance: parseFloat(data.trading_balance || '0'),
          createdAt: new Date(data.created_at),
          // updatedAt: data.updated_at ? new Date(data.updated_at) : undefined, // if available in schema
        };
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return { success: true };
      }
    } catch (error) {
      console.error('Error during signup process:', error);
      return { success: false, error: 'An unexpected error occurred during signup.' };
    }
    return { success: false, error: 'Failed to create user.' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    // Optionally clear Supabase session here if using Supabase Auth
  };

  const updateUserBalance = (totalBalance: number, tradingBalance: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        totalBalance,
        tradingBalance
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update Supabase as well
      const updateUserInSupabase = async () => {
        const { error } = await supabase
          .from('users')
          .update({
            total_balance: totalBalance,
            trading_balance: tradingBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        if (error) console.error('Error updating balance in Supabase:', error);
      };
      updateUserInSupabase();
    }
  };

  const updateUserProfile = async (profileData: Partial<User> & { currentPassword?: string }): Promise<boolean> => {
    if (!user) return false;

    try {
      // Prepare data for Supabase update (snake_case)
      const supabaseUpdateData: { [key: string]: any } = {};

      if (profileData.username !== undefined) supabaseUpdateData.username = profileData.username;
      if (profileData.email !== undefined) supabaseUpdateData.email = profileData.email;
      if (profileData.phone !== undefined) supabaseUpdateData.first_name = profileData.phone; // Map phone to first_name
      if (profileData.country !== undefined) supabaseUpdateData.last_name = profileData.country; // Map country to last_name
      if (profileData.role !== undefined) supabaseUpdateData.role = profileData.role;
      if (profileData.status !== undefined) supabaseUpdateData.status = profileData.status;
      if (profileData.password) {
        // In a real app, you'd handle password updates securely, likely via Supabase Auth.
        // For this mock, we'll simulate it. If current password matches, update.
        // This part needs a secure implementation.
        return false; // Placeholder for secure password update logic
      }

      if (Object.keys(supabaseUpdateData).length === 0) return true; // No changes to update

      const { error } = await supabase
        .from('users')
        .update(supabaseUpdateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user profile in Supabase:', error);
        return false;
      }

      // Update local state and localStorage
      const updatedUser = {
        ...user,
        ...profileData,
        phone: profileData.phone || user.phone, // Ensure correct mapping
        country: profileData.country || user.country, // Ensure correct mapping
      };
      if (profileData.phone !== undefined) updatedUser.phone = profileData.phone;
      if (profileData.country !== undefined) updatedUser.country = profileData.country;

      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  const refreshBalance = async () => {
    if (!user) return;

    try {
      // Fetch latest balance from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('total_balance, trading_balance')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance from Supabase:', error);
        // Fallback or show error to user
        return;
      }

      if (data) {
        const updatedUser = {
          ...user,
          totalBalance: parseFloat(data.total_balance || '0'),
          tradingBalance: parseFloat(data.trading_balance || '0'),
          updatedAt: new Date() // Assuming updated_at might be available or just update timestamp
        };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Trigger a refresh event for other components
        window.dispatchEvent(new CustomEvent('balanceRefresh', {
          detail: { user: updatedUser }
        }));
      }
    } catch (error) {
      console.error('Unexpected error during balance refresh:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      signup,
      updateUserBalance,
      updateUserProfile,
      refreshBalance,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}