import express from "express";
import { query } from "../db.js";
import { authRequired } from "./auth.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const rows = await query("SELECT id, name, contact_email, created_at FROM accounts ORDER BY name ASC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load accounts" });
  }
});

export default router;
