
import express from 'express';
import cors from 'cors';
import { db, testConnection } from './database';

export function createServer() {
  const app = express();
  
  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-production-domain.com'] 
      : ['http://localhost:8080', 'http://0.0.0.0:8080'],
    credentials: true
  }));
  
  app.use(express.json());
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // Test database connection
  app.get('/api/test-db', async (req, res) => {
    try {
      const isConnected = await testConnection();
      res.json({ 
        connected: isConnected,
        message: isConnected ? 'Database connection successful' : 'Database connection failed'
      });
    } catch (error) {
      res.status(500).json({ 
        connected: false, 
        message: 'Database connection error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Users endpoint
  app.get('/api/users', async (req, res) => {
    try {
      const users = await db.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  // Update user status
  app.put('/api/users/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const success = await db.updateUserStatus(id, status);
      if (success) {
        res.json({ message: 'User status updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update user status' });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  });
  
  // Get user transactions
  app.get('/api/users/:id/transactions', async (req, res) => {
    try {
      const { id } = req.params;
      const transactions = await db.getUserTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });
  
  // Get pending deposits/withdrawals
  app.get('/api/deposits-withdrawals/pending', async (req, res) => {
    try {
      const pending = await db.getPendingDepositsWithdrawals();
      res.json(pending);
    } catch (error) {
      console.error('Error fetching pending deposits/withdrawals:', error);
      res.status(500).json({ message: 'Failed to fetch pending deposits/withdrawals' });
    }
  });
  
  // Update deposit/withdrawal status
  app.put('/api/deposits-withdrawals/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, processedBy, rejectionReason } = req.body;
      
      const success = await db.updateDepositWithdrawalStatus(id, status, processedBy, rejectionReason);
      if (success) {
        res.json({ message: 'Deposit/withdrawal status updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update deposit/withdrawal status' });
      }
    } catch (error) {
      console.error('Error updating deposit/withdrawal status:', error);
      res.status(500).json({ message: 'Failed to update deposit/withdrawal status' });
    }
  });
  
  return app;
}

// For direct server execution
if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 3001;
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  });
}
