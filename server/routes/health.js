// server/routes/health.js
import express from "express";
import pg from "pg";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    const { rowCount } = await pool.query("select 1");
    res.json({
      ok: true,
      db: rowCount === 1,
      session: Boolean(req.session),
      time: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
