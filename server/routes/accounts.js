import express from "express";
import { query } from "../db.js";

const router = express.Router();

// GET /api/accounts
router.get("/", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT id, name, contact_email, created_at FROM accounts ORDER BY name ASC;"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[accounts] list error:", err);
    res.status(500).json({ success: false, error: "Failed to list accounts" });
  }
});

export default router;
