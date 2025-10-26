// Health & info endpoints
import express from "express";
import { query } from "../db.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const dbCheck = await query("SELECT NOW()");
    res.json({ ok: true, db: "connected", time: dbCheck[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, db: "disconnected" });
  }
});

router.get("/info", (req, res) => {
  res.json({
    app: "Bighorn Portal API",
    version: "1.0.0",
    env: process.env.NODE_ENV || "development"
  });
});

export default router;
