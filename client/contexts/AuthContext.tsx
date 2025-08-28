import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@shared/types';

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

    const allUsers = getAllUsers();
    
    // Check if user already exists
    if (allUsers.find(u => u.email === email)) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username: email.split('@')[0],
      phone: phone || '',
      country: country || '',
      password: password, // Store password for admin viewing
      role: 'user',
      totalBalance: 10000, // Starting balance
      tradingBalance: 5000, // Starting trading balance
      createdAt: new Date(),
      status: 'active'
    };

    // Add to users list and credentials
    const updatedUsers = [...allUsers, newUser];
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    (MOCK_CREDENTIALS as any)[email] = password;

    // Auto login after signup
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
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
    }
  };

  const updateUserProfile = async (profileData: Partial<User> & { currentPassword?: string }): Promise<boolean> => {
    if (!user) return false;

    try {
      // If updating password, verify current password
      if (profileData.currentPassword && profileData.password) {
        const currentStoredPassword = (MOCK_CREDENTIALS as any)[user.email];
        if (currentStoredPassword !== profileData.currentPassword) {
          return false;
        }
      }

      const allUsers = getAllUsers();
      const userIndex = allUsers.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) return false;

      // Update user data
      const updatedUserData = {
        ...allUsers[userIndex],
        username: profileData.username || allUsers[userIndex].username,
        email: profileData.email || allUsers[userIndex].email,
        phone: profileData.phone || allUsers[userIndex].phone,
        country: profileData.country || allUsers[userIndex].country,
        updatedAt: new Date()
      };

      // Update password if provided
      if (profileData.password) {
        updatedUserData.password = profileData.password;
        (MOCK_CREDENTIALS as any)[user.email] = profileData.password;
        
        // If email changed, update credentials with new email
        if (profileData.email && profileData.email !== user.email) {
          delete (MOCK_CREDENTIALS as any)[user.email];
          (MOCK_CREDENTIALS as any)[profileData.email] = profileData.password;
        }
      }

      // Update email in credentials if changed
      if (profileData.email && profileData.email !== user.email && !profileData.password) {
        const currentPassword = (MOCK_CREDENTIALS as any)[user.email];
        delete (MOCK_CREDENTIALS as any)[user.email];
        (MOCK_CREDENTIALS as any)[profileData.email] = currentPassword;
      }

      // Update users array
      allUsers[userIndex] = updatedUserData;
      localStorage.setItem('allUsers', JSON.stringify(allUsers));

      // Update current user
      setUser(updatedUserData);
      localStorage.setItem('currentUser', JSON.stringify(updatedUserData));

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  const refreshBalance = async () => {
    // In a real app, this would fetch the latest balance from the database
    // For now, simulate a refresh with random small changes to show real-time updates
    if (user) {
      // Simulate real-time balance updates from pending trades, deposits, etc.
      const randomChange = (Math.random() - 0.5) * 50; // Random change of ±$25
      const updatedUser = {
        ...user,
        totalBalance: Math.max(0, user.totalBalance + randomChange),
        updatedAt: new Date()
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Trigger a refresh event for other components
      window.dispatchEvent(new CustomEvent('balanceRefresh', { 
        detail: { user: updatedUser } 
      }));
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
