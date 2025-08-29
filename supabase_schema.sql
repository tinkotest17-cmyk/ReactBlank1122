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
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    total_balance DECIMAL(15,2) DEFAULT 10000.00,
    trading_balance DECIMAL(15,2) DEFAULT 5000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pair_id VARCHAR,
    symbol VARCHAR,
    type transaction_type NOT NULL,
    action action,
    amount DECIMAL(15,8),
    price DECIMAL(15,8),
    total DECIMAL(15,2),
    status transaction_status DEFAULT 'pending',
    is_timed_trade BOOLEAN DEFAULT FALSE,
    trade_duration INTEGER,
    trade_end_time TIMESTAMP WITH TIME ZONE,
    prediction prediction,
    entry_price DECIMAL(15,8),
    exit_price DECIMAL(15,8),
    pnl DECIMAL(15,2),
    crypto_type VARCHAR,
    address VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active trades table
CREATE TABLE IF NOT EXISTS active_trades (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pair_id VARCHAR,
    symbol VARCHAR,
    type transaction_type NOT NULL,
    action action,
    amount DECIMAL(15,8),
    price DECIMAL(15,8),
    total DECIMAL(15,2),
    status transaction_status DEFAULT 'pending',
    is_timed_trade BOOLEAN DEFAULT FALSE,
    trade_duration INTEGER,
    trade_end_time TIMESTAMP WITH TIME ZONE,
    prediction prediction,
    entry_price DECIMAL(15,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits and withdrawals table
CREATE TABLE IF NOT EXISTS deposits_withdrawals (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR NOT NULL,
    type deposit_withdrawal_type NOT NULL,
    crypto_type VARCHAR NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    address VARCHAR NOT NULL,
    status transaction_status DEFAULT 'pending',
    processed_by VARCHAR,
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can view their own active trades
CREATE POLICY "Users can view own active trades" ON active_trades
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can view their own deposits/withdrawals
CREATE POLICY "Users can view own deposits withdrawals" ON deposits_withdrawals
  FOR SELECT USING (auth.uid()::text = user_id);

-- Admin policies (you'll need to set up proper admin authentication)
CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admins can view all deposits withdrawals" ON deposits_withdrawals
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

-- Insert sample admin user (change the credentials!)
INSERT INTO users (id, email, username, role, status, total_balance, trading_balance)
VALUES (
  'admin-' || gen_random_uuid()::text,
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
  'user-' || gen_random_uuid()::text,
  'user@example.com',
  'testuser',
  'user',
  'active',
  10000.00,
  5000.00
) ON CONFLICT (email) DO NOTHING;