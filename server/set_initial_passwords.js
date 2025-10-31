import bcrypt from "bcryptjs";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DEFAULT_PASSWORD = "Welcome2025!";

async function setPasswords() {
  const users = [
    'angela.packard@chsinc.com',
    'scali@parpacific.com',
    'jrgustafson@gmail.com',
    'trent@haralson-consulting.com',
    'ethanfornshell@bhboot.com'
  ];

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const email of users) {
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      [hash, email]
    );
    console.log(`Password set for ${email}`);
  }

  await pool.end();
  console.log("All done.");
}

setPasswords();
