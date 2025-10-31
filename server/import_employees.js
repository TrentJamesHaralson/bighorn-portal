import fs from "fs";
import csv from "csv-parser";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const inputFile = "employees_master.csv";
const defaultPassword = "ChangeMe2025!";

function normalizeRole(r) {
  if (!r) return "EMPLOYEE";
  const up = String(r).trim().toUpperCase();
  if (up === "ADMIN" || up === "ADMINISTRATOR") return "ADMINISTRATOR";
  return "EMPLOYEE";
}

async function getOrCreateAccountByName(name) {
  if (!name || !name.trim()) throw new Error("Missing account_name");
  const nameTrim = name.trim();

  let res = await pool.query(
    "SELECT id FROM accounts WHERE name = $1",
    [nameTrim]
  );
  if (res.rows.length) return res.rows[0].id;

  const id = uuidv4();
  res = await pool.query(
    "INSERT INTO accounts (id, name) VALUES ($1, $2) RETURNING id",
    [id, nameTrim]
  );
  return res.rows[0].id;
}

async function upsertUser({ accountId, firstName, lastName, email, role }) {
  const emailNorm = String(email || "").trim().toLowerCase();
  if (!emailNorm) throw new Error("Missing email");

  const pwHash = await bcrypt.hash(defaultPassword, 10);

  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [emailNorm]
  );

  if (existing.rows.length) {
    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, role = $3, account_id = $4, is_active = true WHERE email = $5",
      [firstName || "", lastName || "", role, accountId, emailNorm]
    );
  } else {
    const id = uuidv4();
    await pool.query(
      "INSERT INTO users (id, first_name, last_name, email, role, account_id, password_hash, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, true)",
      [id, firstName || "", lastName || "", emailNorm, role, accountId, pwHash]
    );
  }
}

async function main() {
  console.log("Starting employee import from", inputFile);
  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on("data", (r) => rows.push(r))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log("Rows read:", rows.length);

  let ok = 0,
    fail = 0;

  for (const r of rows) {
    try {
      const accountId = await getOrCreateAccountByName(r.account_name);
      const role = normalizeRole(r.role);
      await upsertUser({
        accountId,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        role,
      });
      ok++;
    } catch (e) {
      fail++;
      console.error("Row failed:", r, e.message);
    }
  }

  console.log(`Import complete. Success: ${ok}, Failed: ${fail}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Importer crashed:", e);
  process.exit(1);
});
