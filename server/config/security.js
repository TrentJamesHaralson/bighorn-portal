// server/config/security.js
import helmet from "helmet";
import rateLimit from "express-rate-limit";

/**
 * Security baseline for Render:
 *  - Secure headers
 *  - Basic rate limits on auth and reset routes
 *  - HTTPS redirect in production behind proxy
 */
export function applySecurity(app) {
  app.use(
    helmet({
      contentSecurityPolicy: false, // tighten after UI is finalized
    })
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(["/login", "/password/"], authLimiter);

  // Enforce HTTPS only in production (keeps local dev easy)
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const proto = req.headers["x-forwarded-proto"];
      if (proto && proto !== "https") {
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
      }
    }
    next();
  });
}
