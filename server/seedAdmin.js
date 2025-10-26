// server/seedAdmin.js
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pkg from "pg";
import { randomUUID } from "crypto";

dotenv.config();
const { Pool } = pkg;

// Validate environment
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL missing in environment.");
  process.exit(1);
}
if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
  console.error("❌ ADMIN_USER or ADMIN_PASS missing in environment.");
  process.exit(1);
}

// Configure PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function getAllowedRole() {
  try {
    const { rows } = await pool.query(`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE table_name = 'users' AND check_clause ILIKE '%role%'
    `);
    const clause = rows?.[0]?.check_clause || "";
    const match = clause.match(/\('?(.*?)'?\)/g);
    if (match) {
      const roles = match
        .join(",")
        .replace(/[()' ]/g, "")
        .split(",")
        .map((r) => r.trim().toLowerCase());
      if (roles.includes("admin")) return "admin";
      if (roles.includes("Admin")) return "Admin";
      if (roles.includes("administrator")) return "administrator";
      return roles[0] || "Admin";
    }
  } catch {
    return "Admin";
  }
  return "Admin";
}

async function seedAdmin() {
  const email = process.env.ADMIN_USER.trim().toLowerCase();
  const plainPass = process.env.ADMIN_PASS;
  const hash = await bcrypt.hash(plainPass, 10);
  const role = await getAllowedRole();

  console.log(`Seeding admin user: ${email} with role '${role}'`);

  try {
    // Check if admin user already exists
    const { rows } = await pool.query(`SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`, [email]);

    if (rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET password_hash = $1, role = $2, is_active = 1
         WHERE lower(email) = lower($3)`,
        [hash, role, email]
      );
      console.log("✅ Existing admin user updated successfully.");
    } else {
      const newId = randomUUID();
      await pool.query(
        `INSERT INTO users (id, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, 1)`,
        [newId, email, hash, role]
      );
      console.log("✅ New admin user inserted successfully.");
    }
  } catch (err) {
    console.error("❌ Error seeding admin user:", err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
