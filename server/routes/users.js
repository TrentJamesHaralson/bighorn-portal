import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";

const router = express.Router();

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT id, account_id, email, role, COALESCE(active, is_active = 1) AS active, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("[USERS] list error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  const { account_id, email, password, role = "EMPLOYEE", active = true } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  try {
    const hash = bcrypt.hashSync(password, 10);
    await query(
      "INSERT INTO users (id, account_id, email, password_hash, role, is_active, active, created_at) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, CASE WHEN $5 THEN 1 ELSE 0 END, $5, CURRENT_TIMESTAMP)",
      [account_id || null, email, hash, role, !!active]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("[USERS] create error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /api/users/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { role, active } = req.body || {};
  try {
    const rows = await query(
      "UPDATE users SET role = COALESCE($2, role), active = COALESCE($3, active) WHERE id = $1 RETURNING id, email, role, active",
      [id, role, active]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("[USERS] update error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/users/:id (soft-disable)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await query("UPDATE users SET active = false, is_active = 0 WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("[USERS] delete error:", err);
    res.status(500).json({ error: "Failed to disable user" });
  }
});

export default router;
