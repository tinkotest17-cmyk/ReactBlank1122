# Supabase Integration Guide for EdgeMarket Trading Platform

This document provides step-by-step instructions for integrating EdgeMarket with Supabase PostgreSQL database.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Basic understanding of SQL and PostgreSQL
3. Node.js environment with the EdgeMarket application

## Step 1: Create Supabase Project

1. Go to the [Supabase dashboard](https://supabase.com/dashboard/projects)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `edgemarket-trading`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click "Create new project"
5. Wait for project initialization (2-3 minutes)

## Step 2: Get Database Connection Details

1. In your Supabase project dashboard, click "Connect" in the top toolbar
2. Navigate to "Connection string" → "Transaction pooler"
3. Copy the URI value
4. Replace `[YOUR-PASSWORD]` with the database password you set during project creation

The connection string will look like:
```
postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

## Step 3: Set Environment Variables

Create or update your `.env` file with the Supabase connection string:

```env
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

> **Important**: Never commit your `.env` file to version control. Add it to `.gitignore`.

## Step 4: Install Required Dependencies

The following packages are already included in the project:

```bash
npm install drizzle-orm drizzle-zod pg @types/pg
```

For database migrations, you may also want:

```bash
npm install -D drizzle-kit
```

## Step 5: Database Schema Setup

The database schema is defined in `shared/schema.ts`. To create the tables in Supabase:

### Option A: Using Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the sidebar
3. Create a new query and paste the following SQL:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE transaction_type AS ENUM ('trade', 'deposit', 'withdrawal', 'balance_adjustment');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed', 'won', 'lost', 'approved', 'rejected');
CREATE TYPE action AS ENUM ('buy', 'sell');
CREATE TYPE prediction AS ENUM ('up', 'down');

-- Sessions table (required for authentication)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_session_expire ON sessions(expire);

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    username VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    total_balance DECIMAL(15,2) DEFAULT 0.00,
    trading_balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trading pairs table
CREATE TABLE trading_pairs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    price DECIMAL(15,6) NOT NULL,
    change_24h DECIMAL(10,4) DEFAULT 0.00,
    volume_24h DECIMAL(20,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    pair_id VARCHAR REFERENCES trading_pairs(id),
    symbol VARCHAR,
    type transaction_type NOT NULL,
    action action,
    amount DECIMAL(15,6) NOT NULL,
    price DECIMAL(15,6),
    total DECIMAL(15,2) NOT NULL,
    pnl DECIMAL(15,2),
    status transaction_status NOT NULL,
    
    -- Timed trade fields
    is_timed_trade BOOLEAN DEFAULT false,
    trade_duration INTEGER, -- in minutes
    trade_end_time TIMESTAMP,
    prediction prediction,
    entry_price DECIMAL(15,6),
    exit_price DECIMAL(15,6),
    
    -- Deposit/Withdrawal fields
    crypto_type VARCHAR,
    address VARCHAR,
    tx_hash VARCHAR,
    confirmations INTEGER,
    
    -- Admin fields
    admin_notes TEXT,
    processed_by VARCHAR REFERENCES users(id),
    processed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Price history table
CREATE TABLE price_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    pair_id VARCHAR NOT NULL REFERENCES trading_pairs(id),
    price DECIMAL(15,6) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_price_history_pair_id ON price_history(pair_id);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp);

-- Admin actions log
CREATE TABLE admin_actions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id VARCHAR NOT NULL REFERENCES users(id),
    target_user_id VARCHAR REFERENCES users(id),
    action VARCHAR NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);

-- Insert default trading pairs
INSERT INTO trading_pairs (symbol, name, price, change_24h, volume_24h) VALUES
('EUR/USD', 'Euro / US Dollar', 1.0842, 0.12, 1250000),
('GBP/USD', 'British Pound / US Dollar', 1.2635, -0.08, 980000),
('USD/JPY', 'US Dollar / Japanese Yen', 149.85, 0.25, 1800000),
('BTC/USDT', 'Bitcoin / Tether', 43285.67, 2.15, 2500000),
('ETH/USDT', 'Ethereum / Tether', 2645.89, 1.89, 1900000),
('AUD/USD', 'Australian Dollar / US Dollar', 0.6589, -0.15, 750000);

-- Create a default admin user (update email and other details as needed)
INSERT INTO users (email, username, role, total_balance, trading_balance) VALUES
('admin@edgemarket.com', 'admin', 'admin', 100000.00, 25000.00);
```

4. Click "Run" to execute the SQL

### Option B: Using Drizzle Migrations (Recommended for production)

Create a `drizzle.config.ts` file in your project root:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  }
} satisfies Config;
```

Generate and run migrations:

```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

## Step 6: Update Application Code

### 6.1 Create Database Connection

Create `server/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
```

### 6.2 Create Storage Implementation

Create `server/storage.ts`:

```typescript
import { db } from './db';
import { users, transactions, tradingPairs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { User, Transaction, TradingPair } from '@shared/types';

export class DatabaseStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserBalance(userId: string, totalBalance: number, tradingBalance: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        totalBalance: totalBalance.toString(), 
        tradingBalance: tradingBalance.toString(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Transaction operations
  async createTransaction(transactionData: any): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt);
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(transactions.createdAt);
  }

  async updateTransactionStatus(transactionId: string, status: string, adminId?: string): Promise<void> {
    await db
      .update(transactions)
      .set({ 
        status: status as any,
        processedBy: adminId,
        processedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(transactions.id, transactionId));
  }

  // Trading pair operations
  async getTradingPairs(): Promise<TradingPair[]> {
    return await db.select().from(tradingPairs);
  }

  async updateTradingPairPrice(pairId: string, price: number): Promise<void> {
    await db
      .update(tradingPairs)
      .set({ 
        price: price.toString(),
        updatedAt: new Date()
      })
      .where(eq(tradingPairs.id, pairId));
  }
}

export const storage = new DatabaseStorage();
```

### 6.3 Update API Routes

Update your `server/routes.ts` to use the database storage:

```typescript
import { storage } from './storage';

// Example route updates
app.get('/api/users', isAuthenticated, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.post('/api/transactions', isAuthenticated, async (req, res) => {
  try {
    const transaction = await storage.createTransaction(req.body);
    res.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});
```

## Step 7: Environment Configuration

### Development Environment

Update your local `.env` file with Supabase credentials:

```env
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
NODE_ENV=development
```

### Production Environment

Set the same environment variables in your production deployment platform (Replit Secrets, Vercel, Netlify, etc.).

## Step 8: Security Considerations

### Row Level Security (RLS)

Enable RLS on sensitive tables in Supabase:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id);
```

### API Security

1. Always validate user input on the server side
2. Use parameterized queries (Drizzle ORM handles this)
3. Implement proper authentication middleware
4. Rate limit API endpoints
5. Sanitize user inputs

## Step 9: Testing the Integration

1. Start your application in development mode
2. Check the server logs for successful database connection
3. Test user registration and login
4. Verify trading operations create database records
5. Test admin operations in the admin panel

## Step 10: Monitoring and Maintenance

### Supabase Dashboard Monitoring

Monitor your database usage in the Supabase dashboard:

- Database size and connection counts
- Query performance and slow queries
- API usage statistics
- Real-time subscriptions

### Backup Strategy

Supabase automatically backs up your database, but consider:

1. Enable point-in-time recovery for production
2. Test restore procedures periodically
3. Export critical data regularly
4. Document your backup and recovery processes

## Common Issues and Solutions

### Connection Issues

**Problem**: `connection refused` or `timeout` errors

**Solutions**:
- Verify DATABASE_URL is correct
- Check if Supabase project is active
- Ensure connection pooling is enabled
- Verify firewall settings

### Migration Issues

**Problem**: Schema changes not applying

**Solutions**:
- Check migration files are generated correctly
- Verify database permissions
- Run migrations manually if needed
- Check for conflicting existing data

### Performance Issues

**Problem**: Slow query performance

**Solutions**:
- Add indexes on frequently queried columns
- Use connection pooling
- Optimize query patterns
- Monitor with Supabase performance insights

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/index.html)
- [EdgeMarket Trading Platform Repository](https://github.com/your-repo/edgemarket)

## Support

For EdgeMarket-specific integration issues, please:

1. Check this documentation first
2. Review the application logs
3. Test with Supabase SQL editor
4. Contact the development team with detailed error messages

---

**Last Updated**: February 2024  
**Version**: 1.0.0