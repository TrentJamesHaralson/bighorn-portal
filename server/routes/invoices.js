// server/routes/invoices.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import { query } from "../db.js";
import { authRequired } from "./auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists at runtime (local and Render)
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage: keep original filename; prepend short random prefix to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const prefix = crypto.randomBytes(4).toString("hex");
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${prefix}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const ok = /pdf|csv$/i.test(file.originalname);
    return ok ? cb(null, true) : cb(new Error("Only PDF or CSV files are allowed."));
  }
});

// List invoices (optionally filter by account)
router.get("/api/invoices", authRequired, async (req, res) => {
  try {
    const { account_id } = req.query;
    const rows = await query(
      `
      SELECT i.id, i.account_id, i.status, i.total, i.created_at, i.file_name,
             ca.name AS account_name
      FROM invoices i
      LEFT JOIN corporate_accounts ca ON ca.id = i.account_id
      ${account_id ? "WHERE i.account_id = $1" : ""}
      ORDER BY i.created_at DESC
      `,
      account_id ? [account_id] : []
    );
    res.json(rows);
  } catch (err) {
    console.error("[INVOICES] list error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload (CSV/PDF) and create invoice row
router.post("/api/invoices/upload", authRequired, upload.single("invoiceFile"), async (req, res) => {
  try {
    const { account_id, status, total } = req.body;
    if (!account_id) return res.status(400).json({ error: "account_id is required" });
    if (!req.file) return res.status(400).json({ error: "invoiceFile is required" });

    // Verify account exists
    const acct = await query("SELECT id FROM corporate_accounts WHERE id = $1", [account_id]);
    if (acct.length === 0) return res.status(400).json({ error: "Invalid account_id" });

    const id = crypto.randomUUID();
    const safeStatus = status && ['unbilled','current','past_due','Uploaded'].includes(status) ? status : 'Uploaded';
    const numericTotal = Number(total || 0) || 0;

    await query(
      `INSERT INTO invoices (id, account_id, status, total, created_at, file_name)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)`,
      [id, account_id, safeStatus, numericTotal, req.file.filename]
    );

    res.json({ ok: true, id, file_name: req.file.filename });
  } catch (err) {
    console.error("[INVOICES] upload error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Download file by invoice id
router.get("/api/invoices/:id/file", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query("SELECT file_name FROM invoices WHERE id = $1 LIMIT 1", [id]);
    const rec = rows[0];
    if (!rec || !rec.file_name) return res.status(404).send("File not found");

    const full = path.join(uploadsDir, rec.file_name);
    if (!fs.existsSync(full)) return res.status(404).send("File missing on server");
    res.download(full, rec.file_name);
  } catch (err) {
    console.error("[INVOICES] download error", err);
    res.status(500).send("Server error");
  }
});

export default router;
