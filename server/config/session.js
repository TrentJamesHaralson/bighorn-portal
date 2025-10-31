// server/config/session.js
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

const PgSession = connectPg(session);

/**
 * Session middleware configured for Render (proxy) and Postgres store.
 * Requirements:
 *  - process.env.DATABASE_URL
 *  - process.env.SESSION_SECRET
 */
export function makeSessionMiddleware() {
  const { DATABASE_URL, SESSION_SECRET } = process.env;
  if (!DATABASE_URL) throw new Error("DATABASE_URL missing");
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET missing");

  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  return session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    name: "bighorn.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
}
