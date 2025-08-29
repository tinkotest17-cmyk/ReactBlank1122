import { type Express } from "express";
import { db } from "./database";

export function registerRoutes(app: Express) {
  // Health check
  app.get("/api/ping", (req, res) => {
    res.json({ message: "Server is running", timestamp: new Date().toISOString() });
  });

  // Demo route
  app.get("/api/demo", (req, res) => {
    res.json({ message: "Demo endpoint working" });
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await db.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Suspend/activate user
  app.patch("/api/users/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const userId = req.params.id;

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'active' or 'suspended'" });
      }

      const success = await db.updateUserStatus(userId, status);

      if (success) {
        res.json({ success: true, message: `User ${status} successfully` });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Transactions routes
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const transactions = await db.getUserTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Deposits/Withdrawals routes
  app.get("/api/deposits-withdrawals", async (req, res) => {
    try {
      const items = await db.getPendingDepositsWithdrawals();
      res.json(items);
    } catch (error) {
      console.error('Error fetching deposits/withdrawals:', error);
      res.status(500).json({ error: "Failed to fetch deposits/withdrawals" });
    }
  });

  app.patch("/api/deposits-withdrawals/:id", async (req, res) => {
    try {
      const { status, processedBy, rejectionReason } = req.body;
      const success = await db.updateDepositWithdrawalStatus(
        req.params.id,
        status,
        processedBy,
        rejectionReason
      );

      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to update status" });
      }
    } catch (error) {
      console.error('Error updating deposit/withdrawal:', error);
      res.status(500).json({ error: "Failed to update deposit/withdrawal" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await db.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/admin/users/:userId/status', async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    try {
      const success = await db.updateUserStatus(userId, status);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: 'Failed to update user status' });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  });

  // Get pending deposits/withdrawals
  app.get('/api/admin/pending-transactions', async (req, res) => {
    try {
      const transactions = await db.getPendingDepositsWithdrawals();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      res.status(500).json({ message: 'Failed to fetch pending transactions' });
    }
  });
}