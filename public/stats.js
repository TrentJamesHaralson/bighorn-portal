// server/routes/stats.js
import express from "express";
import { query } from "../db.js";
import { authRequired } from "./auth.js";

const router = express.Router();

router.get("/api/stats", authRequired, async (_req, res) => {
  try {
    const [accts, users, invs, vchs] = await Promise.all([
      query("SELECT COUNT(*)::int AS n FROM corporate_accounts"),
      query("SELECT COUNT(*)::int AS n FROM users WHERE COALESCE(is_active,1)=1"),
      query("SELECT COUNT(*)::int AS n FROM invoices"),
      query("SELECT COUNT(*)::int AS n FROM vouchers")
    ]);
    res.json({
      accounts: accts[0]?.n || 0,
      active_users: users[0]?.n || 0,
      invoices: invs[0]?.n || 0,
      vouchers: vchs[0]?.n || 0
    });
  } catch (err) {
    console.error("[STATS] error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
