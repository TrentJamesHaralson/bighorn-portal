import express from "express";

const router = express.Router();

// Quick probes to verify cookies/sessions in prod
router.get("/whoami", (req, res) => {
  res.json({
    node_env: process.env.NODE_ENV || "development",
    has_session: !!req.session,
    session_id: req.sessionID || null,
    user: req.session && req.session.user ? req.session.user : null
  });
});

router.get("/ping", (_req, res) => res.json({ ok: true }));

export default router;
