import express from "express";
import multer from "multer";
import path from "path";
import { query } from "../db.js";

const router = express.Router();

// Configure Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/invoices"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// GET all invoices
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, account_id, status, total, created_at, file_name FROM invoices ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("[INVOICES] Fetch error:", err);
    res.status(500).send("Server error");
  }
});

// POST /upload - handle QuickBooks file upload
router.post("/upload", upload.single("invoiceFile"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded.");

    // Insert file metadata into DB
    await query(
      `INSERT INTO invoices (account_id, status, total, created_at, file_name)
       VALUES (NULL, 'Uploaded', 0, NOW(), $1)`,
      [file.filename]
    );

    console.log(`[UPLOAD] Invoice file saved: ${file.filename}`);
    res.status(200).json({ success: true, file: file.filename });
  } catch (err) {
    console.error("[INVOICES] Upload error:", err);
    res.status(500).send("Upload failed");
  }
});

export default router;
