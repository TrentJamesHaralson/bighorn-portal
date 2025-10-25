import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("[DB] DATABASE_URL is missing in .env");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function query(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return res.rows;
  } catch (err) {
    console.error("[DB ERROR]", err.message);
    throw err;
  }
}