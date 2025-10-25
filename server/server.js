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
import vouchersRoutes from "./routes/vouchers.js";
import invoicesApi from "./routes/invoices.js";
import portalRoutes from "./routes/portalRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Serve static assets
app.use(express.static(path.join(__dirname, "../public")));

// Primary routes
app.use("/api/accounts", accountsApi);
app.use("/api/users", usersApi);
app.use("/api/invoices", invoicesApi);
app.use("/api", portalRoutes); // /api/health etc.
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/vouchers", vouchersRoutes);

// Root redirect (Fixes 404 at /)
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Fallback for unmatched routes
app.use((req, res) => res.status(404).send("Page not found"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
