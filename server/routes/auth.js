import express from "express";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { query } from "../db.js";

dotenv.config();
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware: Require auth for protected routes
export function authRequired(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// GET /login
router.get("/login", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../public/login.html"));
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).send("Missing credentials");

  try {
    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    // 1. Check for admin user (environment-based)
    if (email === ADMIN_USER && password === ADMIN_PASS) {
      req.session.user = { email: ADMIN_USER, role: "admin" };
      console.log("[AUTH] Admin login successful");
      return res.redirect("/dashboard");
    }

    // 2. Check for DB user
    const rows = await query(
      "SELECT id, email, password_hash, role, COALESCE(active, is_active = 1 OR is_active = '1') AS active FROM users WHERE email = $1",
      [email]
    );

    const user = rows[0];
    if (!user || !user.active) {
      console.warn("[AUTH] Invalid user or inactive:", email);
      return res.status(401).send("Invalid email or password.");
    }

    const ok = bcrypt.compareSync(password || "", user.password_hash || "");
    if (!ok) {
      console.warn("[AUTH] Password mismatch for:", email);
      return res.status(401).send("Invalid email or password.");
    }

    // 3. Save session and redirect
    req.session.user = { id: user.id, email: user.email, role: user.role };
    console.log(`[AUTH] Login successful for ${email}`);
    return res.redirect("/dashboard");

  } catch (err) {
    console.error("[AUTH] Login error:", err);
    return res.status(500).send("Server error");
  }
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
