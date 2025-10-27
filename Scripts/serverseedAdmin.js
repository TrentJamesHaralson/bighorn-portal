import bcrypt from "bcrypt";
import pkg from "pg";
const { Client } = pkg;

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await db.connect();

const adminEmail = "admin@bighorn.local";
const password = "Bighorn2025!";
const hashedPassword = await bcrypt.hash(password, 10);

const result = await db.query("SELECT * FROM users WHERE email = $1", [adminEmail]);
if (result.rows.length === 0) {
  await db.query(
    `INSERT INTO users (id, account_id, email, password_hash, role, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
    ["admin-global-0001", "corp-0001", adminEmail, hashedPassword, "ADMINISTRATOR", 1]
  );
  console.log("✅ Global admin created:", adminEmail);
} else {
  console.log("ℹ️ Global admin already exists.");
}

await db.end();
