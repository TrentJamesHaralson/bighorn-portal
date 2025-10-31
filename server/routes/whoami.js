// server/routes/whoami.js
import express from "express";
import { requireAuth } from "../middleware/authz.js";

const router = express.Router();

router.get("/whoami", requireAuth, (req, res) => {
  res.json({ user: req.session.user || null });
});

export default router;
