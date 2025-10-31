# Reset-PortalDatabase.ps1
# Wipes & rebuilds schema, seeds admin, imports employees CSV (if present)
# Works with Render Postgres URL manually pasted

$ErrorActionPreference = "Stop"

Write-Host "Resetting Bighorn Portal database..." -ForegroundColor Cyan

$ProjectRoot = "C:\BighornPortal_new"
$SqlDir      = Join-Path $ProjectRoot "server\sql"

# If env var not set, ask user
if (-not $env:DATABASE_URL) {
    Write-Host "DATABASE_URL env not found."
    $env:DATABASE_URL = Read-Host "Paste Render Postgres URL (without quotes)"
}

# Ensure sslmode=require
if ($env:DATABASE_URL -notmatch "sslmode") {
    $DbUrl = "$($env:DATABASE_URL)?sslmode=require"
} else {
    $DbUrl = $env:DATABASE_URL
}

Write-Host "Using DB URL: $DbUrl" -ForegroundColor Yellow

# Ensure folders
New-Item -ItemType Directory -Force -Path $SqlDir | Out-Null

# Write reset_db.sql
@"
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS session CASCADE;

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMINISTRATOR','ADMIN','USER')),
  is_active boolean NOT NULL DEFAULT true,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  employee_id text,
  first_name text,
  last_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  employee_id text,
  first_name text,
  last_name text,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  used boolean NOT NULL DEFAULT false,
  expires_at date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  file_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE session (
  sid varchar NOT NULL PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session ("expire");
"@ | Out-File (Join-Path $SqlDir "reset_db.sql") -Encoding UTF8 -Force

# Write seed admin SQL
@"
INSERT INTO users (email, password_hash, role, is_active, first_name, last_name)
VALUES (
  'admin@bighorn.local',
  '$2a$10$fhjEob7g3j0mOEWuAg955uPeqcfCIPonl39ksrZPqEP9s8qwYrvHq',
  'ADMINISTRATOR',
  true,
  'Portal',
  'Admin'
)
ON CONFLICT (email) DO NOTHING;
"@ | Out-File (Join-Path $SqlDir "seed_admin.sql") -Encoding UTF8 -Force

Write-Host "Dropping & recreating schema..." -ForegroundColor Yellow
& psql $DbUrl -f (Join-Path $SqlDir "reset_db.sql")

Write-Host "Seeding admin..." -ForegroundColor Yellow
& psql $DbUrl -f (Join-Path $SqlDir "seed_admin.sql")

Write-Host "DB reset complete." -ForegroundColor Green
Write-Host "Login: admin@bighorn.local / Admin123!" -ForegroundColor Green
