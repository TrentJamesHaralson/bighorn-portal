param(
  [string]$AdminEmail = "admin@bighorn.local",
  [string]$AdminPassword = "ChangeMe123!"
)

$env:ADMIN_USER = $AdminEmail
$env:ADMIN_PASS = $AdminPassword

Write-Host "Resetting admin to $AdminEmail ..."
node server/seedAdmin.js

Write-Host "Verifying users table..."
psql "$env:DATABASE_URL" -c "SELECT email, role, is_active FROM users ORDER BY email;"
