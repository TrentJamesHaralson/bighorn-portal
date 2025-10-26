import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { authRequired } from "./auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", authRequired, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/dashboard.html"));
});

export default router;
