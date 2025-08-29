
import { type Express } from "express";
import { createServer } from "http";
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
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Transactions routes
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const transactions = await db.getUserTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Deposits/Withdrawals routes
  app.get("/api/deposits-withdrawals", async (req, res) => {
    try {
      const items = await db.getPendingDepositsWithdrawals();
      res.json(items);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to update deposit/withdrawal" });
    }
  });
}
