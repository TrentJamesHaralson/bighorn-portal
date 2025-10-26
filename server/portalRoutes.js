// server/routes/portalRoutes.js (ESM, PostgreSQL health and status endpoints)
import express from "express";
import { query } from "../db.js";

const router = express.Router();

// Simple health check
router.get("/health", async (req, res) => {
  try {
    const dbCheck = await query("SELECT NOW()");
    res.status(200).json({
      status: "ok",
      db: "connected",
      time: dbCheck[0].now,
    });
  } catch (err) {
    console.error("[HEALTH ERROR]", err.message);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Optional info route
router.get("/info", (req, res) => {
  res.json({
    app: "Bighorn Portal API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

export default router;
