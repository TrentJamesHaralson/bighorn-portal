import express from "express";
import { query } from "../db.js";
import { authRequired } from "./auth.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const rows = await query(`
      SELECT id, account_id, email, role,
             COALESCE(is_active::boolean, true) AS is_active,
             created_at
      FROM users
      ORDER BY created_at DESC NULLS LAST
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load users" });
  }
});

export default router;
