import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authz.js";

const router = Router();

router.get("/", requireAuth, requireRole("ADMINISTRATOR","MANAGER"), (_req, res) => {
res.render("reports", { user: _req.session.user, message: "Integration in process" });
});

export default router;
