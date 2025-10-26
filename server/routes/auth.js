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

// Helper: require auth
export function authRequired(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect("/login");
}

// GET /login (page)
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/login.html"));
});

// POST /login (form)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Email and password are required.");

    // 1) Try DB user
    let dbUser;
    try {
      const rows = await query(
        `SELECT id, email, password_hash, role, 
                CASE 
                  WHEN is_active IS NULL AND active IS NULL THEN true
                  WHEN is_active::text IN ('1','t','true') OR active::text IN ('1','t','true') THEN true
                  ELSE false
                END AS active
         FROM users
         WHERE lower(email) = lower($1)
         LIMIT 1`,
        [email]
      );
      dbUser = rows[0];
    } catch (_) {}

    if (dbUser && dbUser.active) {
      const ok = dbUser.password_hash ? await bcrypt.compare(password, dbUser.password_hash) : false;
      if (ok) {
        req.session.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role || "user" };
        return res.redirect("/dashboard");
      }
    }

    // 2) Fallback to ADMIN_USER/ADMIN_PASS (env) for bootstrap
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;
    if (adminUser && adminPass && email.lower?.() ? email.lower() === adminUser.lower() : (email.toLowerCase() === adminUser.toLowerCase())) {
      const okAdmin = password === adminPass;
      if (okAdmin) {
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

export default router;
