import express from "express";
import session from "express-session";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import accountsApi from "./routes/accounts.js";
import usersApi from "./routes/users.js";
import invoicesApi from "./routes/invoices.js";
import vouchersRoutes from "./routes/vouchers.js";
import portalRoutes from "./routes/portalRoutes.js";
import shopifyApi from "./routes/shopify.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const NODE_ENV = process.env.NODE_ENV || "production";
const isProd = NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(morgan(isProd ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: "bhp.sid",
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", portalRoutes);
app.use("/api/accounts", accountsApi);
app.use("/api/users", usersApi);
app.use("/api/invoices", invoicesApi);
app.use("/api/shopify", shopifyApi);

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/vouchers", vouchersRoutes);

app.get("/", (req, res) => res.redirect("/login"));

app.get("/accounts", (req, res) => res.sendFile(path.join(__dirname, "../public/accounts.html")));
app.get("/users",    (req, res) => res.sendFile(path.join(__dirname, "../public/users.html")));
app.get("/invoices", (req, res) => res.sendFile(path.join(__dirname, "../public/invoices.html")));

app.use((req, res) => res.status(404).send("Page not found"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bighorn Portal listening on :${PORT} (${NODE_ENV})`));
