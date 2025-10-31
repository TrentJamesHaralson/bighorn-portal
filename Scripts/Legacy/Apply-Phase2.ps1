# Apply-Phase2.ps1
# 1) Patch DB schema (status/file_name)
# 2) Stage regenerated files
# 3) Commit & push to trigger Render deploy

param(
  [string]$DBURL = "postgresql://bighornportal_db_user:RPFbbRNiusjleFbKvtySAj1Rr6B11zQ0@dpg-d3rblgripnbc73bojslg-a.oregon-postgres.render.com/bighornportal_db"
)

$patch = @"
-- Phase2 schema patch
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS file_name TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoices_status_check'
  ) THEN
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_status_check CHECK (status = ANY (ARRAY['unbilled','current','past_due','Uploaded']));
  ELSE
    ALTER TABLE invoices DROP CONSTRAINT invoices_status_check;
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_status_check CHECK (status = ANY (ARRAY['unbilled','current','past_due','Uploaded']));
  END IF;
END$$;
"@

Write-Host "Applying DB patch..."
$patch | psql $DBURL

Write-Host "Staging changed files..."
git add server/routes/invoices.js server/routes/vouchers.js server/routes/stats.js `
  public/invoices.html public/vouchers.html public/dashboard.html

if ($LASTEXITCODE -ne 0) { Write-Error "git add failed"; exit 1 }

git commit -m "Phase 2: invoices upload/list/download; vouchers shell; dashboard stats"
git push origin main

Write-Host "Done. Render should redeploy automatically."
