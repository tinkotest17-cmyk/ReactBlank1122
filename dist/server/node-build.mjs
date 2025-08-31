import path from "path";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "your-service-key";
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const db = {
  async getAllUsers() {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching users from Supabase:", error);
        return JSON.parse(localStorage?.getItem("users") || "[]");
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
  async updateUserStatus(userId, status) {
    try {
      const { error } = await supabase.from("users").update({ status, updated_at: /* @__PURE__ */ new Date() }).eq("id", userId);
      if (error) {
        console.error("Error updating user status in Supabase:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error updating user status:", error);
      return false;
    }
  },
  async getUserTransactions(userId) {
    try {
      const { data, error } = await supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching transactions from Supabase:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  },
  async getPendingDepositsWithdrawals() {
    try {
      const { data, error } = await supabase.from("deposits_withdrawals").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching deposits/withdrawals from Supabase:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching deposits/withdrawals:", error);
      return [];
    }
  },
  async updateDepositWithdrawalStatus(id, status, processedBy, rejectionReason) {
    try {
      const updateData = {
        status,
        updated_at: /* @__PURE__ */ new Date()
      };
      if (processedBy) updateData.processed_by = processedBy;
      if (rejectionReason) updateData.rejection_reason = rejectionReason;
      if (status === "approved" || status === "rejected") updateData.processed_at = /* @__PURE__ */ new Date();
      const { error } = await supabase.from("deposits_withdrawals").update(updateData).eq("id", id);
      if (error) {
        console.error("Error updating deposit/withdrawal status in Supabase:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error updating deposit/withdrawal status:", error);
      return false;
    }
  }
};
async function testConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true });
    if (error) {
      console.log("⚠️ Supabase connection failed, using localStorage fallback");
      return false;
    }
    console.log("✅ Database connection established");
    return true;
  } catch (error) {
    console.log("⚠️ Supabase connection failed, using localStorage fallback");
    return false;
  }
}
function createServer() {
  const app2 = express__default();
  app2.use(cors({
    origin: ["https://your-production-domain.com"],
    credentials: true
  }));
  app2.use(express__default.json());
  app2.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/test-db", async (req, res) => {
    try {
      const isConnected = await testConnection();
      res.json({
        connected: isConnected,
        message: isConnected ? "Database connection successful" : "Database connection failed"
      });
    } catch (error) {
      res.status(500).json({
        connected: false,
        message: "Database connection error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users = await db.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.put("/api/users/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const success = await db.updateUserStatus(id, status);
      if (success) {
        res.json({ message: "User status updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update user status" });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });
  app2.get("/api/users/:id/transactions", async (req, res) => {
    try {
      const { id } = req.params;
      const transactions = await db.getUserTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/deposits-withdrawals/pending", async (req, res) => {
    try {
      const pending = await db.getPendingDepositsWithdrawals();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending deposits/withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch pending deposits/withdrawals" });
    }
  });
  app2.put("/api/deposits-withdrawals/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, processedBy, rejectionReason } = req.body;
      const success = await db.updateDepositWithdrawalStatus(id, status, processedBy, rejectionReason);
      if (success) {
        res.json({ message: "Deposit/withdrawal status updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update deposit/withdrawal status" });
      }
    } catch (error) {
      console.error("Error updating deposit/withdrawal status:", error);
      res.status(500).json({ message: "Failed to update deposit/withdrawal status" });
    }
  });
  return app2;
}
if (require.main === module) {
  const app2 = createServer();
  const port2 = process.env.PORT || 3001;
  app2.listen(port2, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port2}`);
  });
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 EdgeMarket server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
