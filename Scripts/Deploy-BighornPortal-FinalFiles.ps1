$root = "C:\BighornPortal_new\server"

# Ensure folders exist
New-Item -ItemType Directory "$root\middleware" -Force | Out-Null
New-Item -ItemType Directory "$root\routes" -Force | Out-Null

# auth.js (middleware)
@'
export function authRequired(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/login");
}

export function roleRequired(role) {
  return function (req, res, next) {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    }
    return res.status(403).send("Forbidden");
  };
}
'@ | Set-Content "$root\middleware\auth.js" -Encoding UTF8

# auth.js (routes)
@'
import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = Router();

router.get("/login", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/dashboard");
  }
  res.sendFile("login.html", { root: "public" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.redirect("/login?error=1");
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.redirect("/login?error=1");
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      account_id: user.account_id
    };

    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.redirect("/login?error=1");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
'@ | Set-Content "$root\routes\auth.js" -Encoding UTF8

# portalRoutes.js
@'
import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { authRequired } from "../middleware/auth.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/dashboard", authRequired, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

router.get("/users", authRequired, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "users.html"));
});

router.get("/vouchers", authRequired, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "vouchers.html"));
});

router.get("/invoices", authRequired, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "invoices.html"));
});

export default router;
'@ | Set-Content "$root\routes\portalRoutes.js" -Encoding UTF8

# system.js
@'
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
'@ | Set-Content "$root\routes\system.js" -Encoding UTF8

# server.js
@'
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import portalRoutes from "./routes/portalRoutes.js";
import systemRoutes from "./routes/system.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PgSessionStore = pgSession(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(session({
  store: new PgSessionStore({ pool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/", authRoutes);
app.use("/", portalRoutes);
app.use("/system", systemRoutes);

app.get("/", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("/login");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bighorn Portal listening on port " + PORT);
});
'@ | Set-Content "$root\server.js" -Encoding UTF8

Write-Host "Bighorn Portal final backend files deployed."
