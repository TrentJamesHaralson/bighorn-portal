import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { query } from "../db.js";

const router = express.Router();

// storage dir: C:\BighornPortal_New\uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// GET /api/invoices  -> list invoices table rows (placeholder-friendly)
router.get("/", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT id, account_id, status, total, created_at FROM invoices ORDER BY created_at DESC;"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[invoices] list error:", err);
    res.status(500).json({ success: false, error: "Failed to list invoices" });
  }
});

// POST /api/invoices/upload  -> upload a QuickBooks export (CSV/PDF/etc.)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    // You can extend here: parse CSV -> insert rows. For now we only store the file.
    res.json({
      success: true,
      data: {
        saved_as: req.file.filename,
        size: req.file.size,
        original_name: req.file.originalname
      }
    });
  } catch (err) {
    console.error("[invoices] upload error:", err);
    res.status(500).json({ success: false, error: "Failed to upload file" });
  }
});

// GET /api/invoices/uploads -> list files currently in uploads folder
router.get("/uploads", (_req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map((f) => ({
      name: f,
      path: `/uploads/${f}` // static exposure is optional; not served by default
    }));
    res.json({ success: true, data: files });
  } catch (err) {
    console.error("[invoices] list uploads error:", err);
    res.status(500).json({ success: false, error: "Failed to list uploads" });
  }
});

export default router;
