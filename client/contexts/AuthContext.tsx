
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  is_admin: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>;
  fetchUsers: () => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize users in localStorage if not exists
const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123',
        balance: 10000,
        is_admin: true,
        is_active: true
      },
      {
        id: '2',
        email: 'user@example.com',
        username: 'user',
        password: 'user123',
        balance: 5000,
        is_admin: false,
        is_active: true
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeLocalStorage();
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, balance, is_admin, is_active');

      if (!error && data) {
        setUsers(data);
      } else {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(localUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          balance: u.balance,
          is_admin: u.is_admin,
          is_active: u.is_active
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(localUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        balance: u.balance,
        is_admin: u.is_admin,
        is_active: u.is_active
      })));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try Supabase authentication first
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!error && data) {
        // In a real app, you'd verify the password hash
        const loginUser = {
          id: data.id,
          email: data.email,
          username: data.username,
          balance: data.balance,
          is_admin: data.is_admin,
          is_active: data.is_active
        };
        
        setUser(loginUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(loginUser));
        return true;
      } else {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = localUsers.find((u: any) => u.email === email && u.password === password);
        
        if (foundUser && foundUser.is_active) {
          const loginUser = {
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
            balance: foundUser.balance,
            is_admin: foundUser.is_admin,
            is_active: foundUser.is_active
          };
          
          setUser(loginUser);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(loginUser));
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    return false;
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      // Try to register in Supabase first
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email,
          username,
          password_hash: password, // In real app, hash this
          balance: 1000,
          is_admin: false,
          is_active: true
        }])
        .select()
        .single();

      if (!error && data) {
        await fetchUsers();
        return true;
      } else {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (localUsers.some((u: any) => u.email === email || u.username === username)) {
          return false;
        }

        const newUser = {
          id: Date.now().toString(),
          email,
          username,
          password,
          balance: 1000,
          is_admin: false,
          is_active: true
        };

        localUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(localUsers));
        await fetchUsers();
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    try {
      // Try to update in Supabase first
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = localUsers.map((u: any) => 
          u.id === userId ? { ...u, balance: newBalance } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }

      // Update current user if it's the same user
      if (user && user.id === userId) {
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user balance:', error);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const newStatus = !userToUpdate.is_active;

      // Try to update in Supabase first
      const { error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', userId);

      if (error) {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = localUsers.map((u: any) => 
          u.id === userId ? { ...u, is_active: newStatus } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      // Try to update in Supabase first
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId);

      if (error) {
        // Fallback to localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = localUsers.map((u: any) => 
          u.id === userId ? { ...u, is_admin: true } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error promoting user to admin:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated,
        login,
        register,
        logout,
        updateUserBalance,
        fetchUsers,
        toggleUserStatus,
        promoteToAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
