-- =====================================================
-- Bighorn Portal Database Schema (Final)
-- Updated: 2025-10-27
-- =====================================================

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS corporate_accounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS accounts;

-- Master corporate-level accounts
CREATE TABLE corporate_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User accounts for authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES corporate_accounts(id),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMINISTRATOR','ADMINISTRATIVE','MANAGER','EMPLOYEE')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Optional internal system-level accounts (used by server scripts)
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Employee directory linked to corporate accounts
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES corporate_accounts(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Voucher records (employee benefit / store credit)
CREATE TABLE vouchers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  account_id TEXT REFERENCES corporate_accounts(id),
  employee_id TEXT REFERENCES employees(id),
  amount REAL NOT NULL,
  used INTEGER DEFAULT 0,
  expires_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Invoices uploaded or generated for companies
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES corporate_accounts(id),
  status TEXT NOT NULL CHECK(status IN ('unbilled','current','past_due','Uploaded')),
  total REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  file_name TEXT
);

-- =====================================================
-- End of Schema
-- =====================================================
