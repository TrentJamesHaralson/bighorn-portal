import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { query } from "./db.js";

dotenv.config();

async function seedAdmin() {
  const email = process.env.ADMIN_USER || "admin@bighorn.local";
  const pass = process.env.ADMIN_PASS || "ChangeMe123!";
  const role = "ADMINISTRATOR";

  const hash = await bcrypt.hash(pass, 10);

  // Upsert by email
  const sql = `
    INSERT INTO users (id, account_id, email, password_hash, role, is_active, created_at, active)
    VALUES (gen_random_uuid()::text, NULL, $1, $2, $3, 1, CURRENT_TIMESTAMP, true)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          is_active = EXCLUDED.is_active,
          active = EXCLUDED.active
    RETURNING email, role
  `;
  const rows = await query(sql, [email, hash, role]);
  console.log("Seeded/updated admin:", rows[0]);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error seeding admin:", err);
    process.exit(1);
  });
