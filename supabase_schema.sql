
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE transaction_type AS ENUM ('trade', 'deposit', 'withdrawal', 'balance_adjustment', 'convert');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed', 'won', 'lost', 'approved', 'rejected');
CREATE TYPE action AS ENUM ('buy', 'sell');
CREATE TYPE prediction AS ENUM ('up', 'down');
CREATE TYPE crypto_type AS ENUM ('BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'DOT', 'SOL', 'MATIC');

-- Sessions table for authentication
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_session_expire ON sessions(expire);

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role user_role DEFAULT 'user' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    total_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    trading_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trading pairs table
CREATE TABLE trading_pairs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    symbol VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    type VARCHAR DEFAULT 'forex' NOT NULL, -- 'forex' or 'crypto'
    is_active BOOLEAN DEFAULT true NOT NULL,
    min_trade_amount DECIMAL(15,2) DEFAULT 10.00,
    max_trade_amount DECIMAL(15,2) DEFAULT 10000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default trading pairs
INSERT INTO trading_pairs (symbol, name, type, is_active) VALUES 
('EURUSD', 'Euro / US Dollar', 'forex', true),
('GBPUSD', 'British Pound / US Dollar', 'forex', true),
('USDJPY', 'US Dollar / Japanese Yen', 'forex', true),
('AUDUSD', 'Australian Dollar / US Dollar', 'forex', true),
('USDCAD', 'US Dollar / Canadian Dollar', 'forex', true),
('BTCUSD', 'Bitcoin / US Dollar', 'crypto', true),
('ETHUSD', 'Ethereum / US Dollar', 'crypto', true),
('ADAUSD', 'Cardano / US Dollar', 'crypto', true);

-- Transactions table (main transaction log)
CREATE TABLE transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    status transaction_status NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by VARCHAR REFERENCES users(id)
);

-- Indexes for transactions table
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);

-- Trading transactions table (specific to trades)
CREATE TABLE trading_transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    transaction_id VARCHAR NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trading_pair_id VARCHAR NOT NULL REFERENCES trading_pairs(id),
    symbol VARCHAR NOT NULL,
    action action NOT NULL,
    prediction prediction,
    amount DECIMAL(15,2) NOT NULL,
    entry_price DECIMAL(15,8) NOT NULL,
    exit_price DECIMAL(15,8),
    is_timed_trade BOOLEAN DEFAULT false NOT NULL,
    trade_duration_minutes INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    profit_loss DECIMAL(15,2) DEFAULT 0.00,
    status transaction_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for trading transactions
CREATE INDEX idx_trading_transactions_user_id ON trading_transactions(user_id);
CREATE INDEX idx_trading_transactions_symbol ON trading_transactions(symbol);
CREATE INDEX idx_trading_transactions_status ON trading_transactions(status);
CREATE INDEX idx_trading_transactions_created_at ON trading_transactions(created_at DESC);
CREATE INDEX idx_trading_transactions_expires_at ON trading_transactions(expires_at);

-- Deposits and withdrawals table
CREATE TABLE deposit_withdrawals (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    transaction_id VARCHAR NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR NOT NULL,
    type VARCHAR CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
    crypto_type crypto_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    address TEXT NOT NULL,
    tx_hash VARCHAR,
    status transaction_status DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by VARCHAR REFERENCES users(id)
);

-- Indexes for deposits and withdrawals
CREATE INDEX idx_deposit_withdrawals_user_id ON deposit_withdrawals(user_id);
CREATE INDEX idx_deposit_withdrawals_type ON deposit_withdrawals(type);
CREATE INDEX idx_deposit_withdrawals_status ON deposit_withdrawals(status);
CREATE INDEX idx_deposit_withdrawals_created_at ON deposit_withdrawals(created_at DESC);

-- Crypto wallets table (platform wallets for deposits)
CREATE TABLE crypto_wallets (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    crypto_type crypto_type NOT NULL,
    address TEXT NOT NULL UNIQUE,
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default crypto wallets
INSERT INTO crypto_wallets (crypto_type, address, is_active) VALUES 
('BTC', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', true),
('ETH', '0x742d35Cc6634C0532925a3b8D9C9F95e4E9D7C7f', true),
('USDT', '0x742d35Cc6634C0532925a3b8D9C9F95e4E9D7C7f', true),
('BNB', '0x742d35Cc6634C0532925a3b8D9C9F95e4E9D7C7f', true),
('ADA', 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn493x5cdqy2dwww8', true),
('DOT', '1FRMM8PEiWXYax7rpS6X4XZX1aAAxSWx1CrKTyrVYhV24fg', true),
('SOL', '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', true),
('MATIC', '0x742d35Cc6634C0532925a3b8D9C9F95e4E9D7C7f', true);

-- Price history table for charts
CREATE TABLE price_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    symbol VARCHAR NOT NULL,
    price DECIMAL(15,8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for price history
CREATE INDEX idx_price_history_symbol ON price_history(symbol);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);
CREATE INDEX idx_price_history_symbol_timestamp ON price_history(symbol, timestamp DESC);

-- Admin audit log table
CREATE TABLE admin_audit_log (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    admin_id VARCHAR NOT NULL REFERENCES users(id),
    admin_email VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    target_user_id VARCHAR REFERENCES users(id),
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for audit log
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);

-- Balance conversion log table
CREATE TABLE balance_conversions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_balance_type VARCHAR NOT NULL, -- 'total' or 'trading'
    to_balance_type VARCHAR NOT NULL,   -- 'total' or 'trading'
    amount DECIMAL(15,2) NOT NULL,
    total_balance_before DECIMAL(15,2) NOT NULL,
    trading_balance_before DECIMAL(15,2) NOT NULL,
    total_balance_after DECIMAL(15,2) NOT NULL,
    trading_balance_after DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for balance conversions
CREATE INDEX idx_balance_conversions_user_id ON balance_conversions(user_id);
CREATE INDEX idx_balance_conversions_created_at ON balance_conversions(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_conversions ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::TEXT = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::TEXT 
            AND role = 'admin'
        )
    );

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can view own trading transactions" ON trading_transactions
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create own trading transactions" ON trading_transactions
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view own deposits/withdrawals" ON deposit_withdrawals
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create own deposits/withdrawals" ON deposit_withdrawals
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- Create some sample price history data
INSERT INTO price_history (symbol, price, timestamp) VALUES 
('EURUSD', 1.0856, NOW() - INTERVAL '1 hour'),
('EURUSD', 1.0863, NOW() - INTERVAL '45 minutes'),
('EURUSD', 1.0851, NOW() - INTERVAL '30 minutes'),
('EURUSD', 1.0847, NOW() - INTERVAL '15 minutes'),
('EURUSD', 1.0859, NOW()),
('GBPUSD', 1.2745, NOW() - INTERVAL '1 hour'),
('GBPUSD', 1.2751, NOW() - INTERVAL '45 minutes'),
('GBPUSD', 1.2739, NOW() - INTERVAL '30 minutes'),
('GBPUSD', 1.2756, NOW() - INTERVAL '15 minutes'),
('GBPUSD', 1.2748, NOW()),
('BTCUSD', 43250.75, NOW() - INTERVAL '1 hour'),
('BTCUSD', 43180.25, NOW() - INTERVAL '45 minutes'),
('BTCUSD', 43305.50, NOW() - INTERVAL '30 minutes'),
('BTCUSD', 43275.00, NOW() - INTERVAL '15 minutes'),
('BTCUSD', 43320.25, NOW());

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_composite ON users(role, status, created_at);
CREATE INDEX CONCURRENTLY idx_transactions_composite ON transactions(user_id, type, status, created_at);
CREATE INDEX CONCURRENTLY idx_trading_composite ON trading_transactions(user_id, status, created_at);
