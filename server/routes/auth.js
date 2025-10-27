import express from "express";
import bcrypt from "bcryptjs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { query } from "../db.js";

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: require auth
export function authRequired(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect("/login");
}

// GET /login
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/login.html"));
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Email and password are required.");

    // Try DB user
    let dbUser;
    try {
      const rows = await query(
        `SELECT id, email, password_hash, role,
                CASE
                  WHEN is_active IS NULL THEN 1
                  ELSE is_active
                END AS is_active
         FROM users
         WHERE lower(email) = lower($1)
         LIMIT 1`,
        [email]
      );
      dbUser = rows[0];
    } catch (_) {}

    if (dbUser && Number(dbUser.is_active) === 1) {
      const ok = dbUser.password_hash ? await bcrypt.compare(password, dbUser.password_hash) : false;
      if (ok) {
        req.session.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role || "user" };
        return res.redirect("/dashboard");
      }
    }

    // Fallback bootstrap admin from env
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;
    if (adminUser && adminPass && email.toLowerCase() === adminUser.toLowerCase()) {
      if (password === adminPass) {
        req.session.user = { id: "admin", email: adminUser, role: "admin" };
        return res.redirect("/dashboard");
      }
    }

    return res.status(401).send("Invalid email or password.");
  } catch (err) {
    console.error("[AUTH] Login error:", err);
    return res.status(500).send("Server error");
  }
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

/* =========================
   Password Reset Flow
   - GET /forgot (page)
   - POST /api/auth/forgot (create token)
   - GET /reset-password (page)
   - POST /api/auth/reset (apply new password)
   ========================= */

// Forgot page
router.get("/forgot", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/forgot.html"));
});

// Reset page
router.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/reset.html"));
});

// POST /api/auth/forgot
router.post("/api/auth/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const rows = await query(
      "SELECT id, email FROM users WHERE lower(email) = lower($1) LIMIT 1",
      [email]
    );
    const user = rows[0];
    if (!user) {
      // Do not reveal user existence
      return res.json({ ok: true });
    }

    // Create token valid for 60 minutes
    const id = crypto.randomUUID();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 mins

    await query(
      `INSERT INTO password_resets (id, user_id, token, expires_at, used)
       VALUES ($1, $2, $3, $4, 0)`,
      [id, user.id, token, expiresAt.toISOString()]
    );

    const baseUrl = process.env.PUBLIC_BASE_URL || "";
    const origin =
      baseUrl ||
      (req.protocol + "://" + req.get("host"));
    const resetLink = `${origin}/reset-password?token=${token}`;

    // If email is not yet configured, log the link so admin can share it.
    console.log("[PASSWORD RESET] Link for", user.email, ":", resetLink);

    // TODO: if SMTP is configured, send an email here.

    return res.json({ ok: true });
  } catch (err) {
    console.error("[AUTH] Forgot error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset
router.post("/api/auth/reset", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });
    if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const rows = await query(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used, u.email
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token = $1
       LIMIT 1`,
      [token]
    );
    const rec = rows[0];
    if (!rec) return res.status(400).json({ error: "Invalid token" });
    if (Number(rec.used) === 1) return res.status(400).json({ error: "Token already used" });
    if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ error: "Token expired" });

    const hash = await bcrypt.hash(password, 10);

    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, rec.user_id]);
    await query("UPDATE password_resets SET used = 1 WHERE id = $1", [rec.id]);

    console.log("[PASSWORD RESET] Password updated for", rec.email);
    return res.json({ ok: true });
  } catch (err) {
    console.error("[AUTH] Reset error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
