import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query } from "../db.js";

const router = express.Router();

// Ensure upload directory exists at startup
const uploadDir = path.join(process.cwd(), "uploads", "invoices");
fs.mkdirSync(uploadDir, { recursive: true });

// Configure Multer for invoice uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// GET /api/invoices
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, account_id, status, total, created_at, file_name
       FROM invoices
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[INVOICES] Fetch error:", err);
    res.status(500).json({ error: "Failed to load invoices." });
  }
});

// POST /api/invoices/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const newId = Date.now().toString();

    await query(
      `INSERT INTO invoices (id, account_id, status, total, created_at, file_name)
       VALUES ($1, NULL, 'Uploaded', 0, CURRENT_TIMESTAMP, $2)`,
      [newId, fileName]
    );

    res.status(200).json({ message: "Invoice uploaded successfully!" });
  } catch (err) {
    console.error("[INVOICES] Upload error:", err);
    res.status(500).json({ error: "Failed to upload invoice." });
  }
});

// Serve static uploaded files
router.get("/files/:name", (req, res) => {
  const filePath = path.join(uploadDir, req.params.name);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

export default router;
