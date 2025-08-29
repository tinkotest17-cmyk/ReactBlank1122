
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (matches AuthContext expectations)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active trades table (matches TradingContext expectations)
CREATE TABLE IF NOT EXISTS activeTrades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (matches code expectations)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'deposit', 'withdraw', 'trade'
  cryptoType VARCHAR(20) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits and withdrawals table (matches code expectations)
CREATE TABLE IF NOT EXISTS deposits_withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'deposit' or 'withdraw'
  cryptoType VARCHAR(20) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  wallet_address VARCHAR(255),
  transaction_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, password_hash, is_admin, balance) 
VALUES ('admin@example.com', 'admin', '$2b$10$rQ8K0K0K0K0K0K0K0K0K0u', true, 10000.00)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_activeTrades_userId ON activeTrades(userId);
CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId);
CREATE INDEX IF NOT EXISTS idx_deposits_withdrawals_userId ON deposits_withdrawals(userId);
