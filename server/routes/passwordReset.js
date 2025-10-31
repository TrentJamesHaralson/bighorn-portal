// server/routes/passwordReset.js
import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import pg from "pg";
import { makeMailer } from "../config/mailer.js";

const router = express.Router();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const mailer = makeMailer();

/**
 * POST /password/forgot
 * Body: email
 * Always returns ok:true to avoid email enumeration.
 */
router.post("/password/forgot", express.urlencoded({ extended: false }), async (req, res) => {
  const { email } = req.body || {};
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  try {
    const { rows } = await pool.query(
      "select id from users where email=$1 and is_active=true",
      [email]
    );

    if (rows[0]) {
      await pool.query(
        `insert into password_resets (user_id, token, expires_at, used)
         values ($1,$2,$3,false)
         on conflict (user_id) do update set token=$2, expires_at=$3, used=false`,
        [rows[0].id, token, expiresAt]
      );

      const base = process.env.APP_BASE_URL || "";
      const link = `${base.replace(/\/$/, "")}/reset?token=${token}`;

      await mailer.send({
        to: email,
        subject: "Bighorn Portal password reset",
        text: `Use this link to reset your password: ${link}\nThis link expires in 30 minutes.`,
        html: `<p>Use this link to reset your password:</p>
               <p><a href="${link}">${link}</a></p>
               <p>This link expires in 30 minutes.</p>`,
      });
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /password/reset
 * Body: token, password
 */
router.post("/password/reset", express.urlencoded({ extended: false }), async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).send("Missing token or password");

  try {
    const { rows } = await pool.query(
      `select pr.user_id
         from password_resets pr
         join users u on u.id = pr.user_id
        where pr.token=$1 and pr.used=false and pr.expires_at > now()`,
      [token]
    );
    const row = rows[0];
    if (!row) return res.status(400).send("Invalid or expired token");

    const hash = await bcrypt.hash(password, 12);
    await pool.query("update users set password_hash=$1 where id=$2", [hash, row.user_id]);
    await pool.query("update password_resets set used=true where user_id=$1", [row.user_id]);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
