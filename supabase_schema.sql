-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE transaction_type AS ENUM ('trade', 'deposit', 'withdrawal', 'balance_adjustment');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed', 'won', 'lost', 'approved', 'rejected');
CREATE TYPE action AS ENUM ('buy', 'sell');
CREATE TYPE prediction AS ENUM ('up', 'down');
CREATE TYPE deposit_withdrawal_type AS ENUM ('deposit', 'withdraw');

-- Sessions table (required for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  total_balance DECIMAL(15,2) DEFAULT 0.00,
  trading_balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trade', 'deposit', 'withdrawal', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  crypto_type TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active trades table
CREATE TABLE IF NOT EXISTS active_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crypto_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  entry_price DECIMAL(15,8) NOT NULL,
  current_price DECIMAL(15,8),
  profit_loss DECIMAL(15,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits and withdrawals table
CREATE TABLE IF NOT EXISTS deposits_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(15,2) NOT NULL,
  crypto_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    admin_id VARCHAR NOT NULL,
    admin_email VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    target_user_id VARCHAR,
    transaction_id VARCHAR,
    details TEXT,
    old_total_balance DECIMAL(15,2),
    old_trading_balance DECIMAL(15,2),
    new_total_balance DECIMAL(15,2),
    new_trading_balance DECIMAL(15,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_active_trades_user_id ON active_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_withdrawals_user_id ON deposits_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_withdrawals_status ON deposits_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (optional - for basic access)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own trades" ON active_trades FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own trades" ON active_trades FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own deposits/withdrawals" ON deposits_withdrawals FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own deposits/withdrawals" ON deposits_withdrawals FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

-- Insert sample admin user (change the credentials!)
INSERT INTO users (id, email, username, role, status, total_balance, trading_balance)
VALUES (
  gen_random_uuid()::text,
  'admin@edgemarket.com',
  'admin',
  'admin',
  'active',
  100000.00,
  50000.00
) ON CONFLICT (email) DO NOTHING;

-- Insert sample regular user for testing
INSERT INTO users (id, email, username, role, status, total_balance, trading_balance)
VALUES (
  gen_random_uuid()::text,
  'user@example.com',
  'testuser',
  'user',
  'active',
  10000.00,
  5000.00
) ON CONFLICT (email) DO NOTHING;