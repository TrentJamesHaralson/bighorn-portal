// set_user_passwords.js
// Usage: node set_user_passwords.js users.json
// users.json example:
// [
//   {"email":"angela.packard@chsinc.com","password":"Angela#2025"},
//   {"email":"trent@haralson-consulting.com","password":"TrentStrong1!"}
// ]

import fs from "fs";
import bcrypt from "bcryptjs";
import pkg from "pg";
const { Client } = pkg;

if (process.argv.length < 3) {
  console.error("Usage: node set_user_passwords.js path/to/users.json");
  process.exit(2);
}

const jsonPath = process.argv[2];
if (!fs.existsSync(jsonPath)) {
  console.error("File not found:", jsonPath);
  process.exit(2);
}

const list = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const DB = process.env.DATABASE_URL;
if (!DB) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(2);
}

(async () => {
  const client = new Client({
    connectionString: DB,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  for (const item of list) {
    const email = String(item.email || "").trim();
    const password = String(item.password || "");
    if (!email || !password) {
      console.log("Skipping entry with missing email or password:", item);
      continue;
    }
    const hash = await bcrypt.hash(password, 10);
    const res = await client.query(
      "UPDATE users SET password_hash = $1 WHERE lower(email) = lower($2)",
      [hash, email]
    );
    if (res.rowCount === 0) {
      console.log("No user found for", email);
    } else {
      console.log("Updated password for", email);
    }
  }

  await client.end();
  console.log("Done.");
})();
