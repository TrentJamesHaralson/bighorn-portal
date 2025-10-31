import { Router } from "express";
import { pool } from "../db.js";
import { authRequired, roleRequired } from "../middleware/auth.js";

const router = Router();

router.get("/health", authRequired, roleRequired("SYSTEM_ADMIN"), async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({ ok: true, db: true, time: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get("/settings", authRequired, roleRequired("SYSTEM_ADMIN"), (_req, res) => {
  res.json({
    sections: ["General", "Security", "Integrations", "System Health", "Tools"],
    message: "Feature under construction."
  });
});

export default router;
