import express from "express";
import { query } from "../db.js";
import { authRequired } from "./auth.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const rows = await query("SELECT id, account_id, status, total, created_at FROM invoices ORDER BY created_at DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load invoices" });
  }
});

export default router;
