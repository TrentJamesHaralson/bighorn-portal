// server/routes/vouchers.js
import express from "express";
import { query } from "../db.js";
import { authRequired } from "./auth.js";

const router = express.Router();

// Basic list (placeholder friendly)
router.get("/api/vouchers", authRequired, async (req, res) => {
  try {
    const rows = await query(
      `SELECT v.id, v.code, v.account_id, v.employee_id, v.amount, v.used, v.expires_at, v.created_at,
              ca.name AS account_name
       FROM vouchers v
       LEFT JOIN corporate_accounts ca ON ca.id = v.account_id
       ORDER BY v.created_at DESC
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("[VOUCHERS] list error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
