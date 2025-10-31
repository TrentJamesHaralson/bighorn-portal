$envPath = "C:\BighornPortal_new"
cd $envPath

Write-Host "Executing database seeding..." -ForegroundColor Cyan
psql "$env:DATABASE_URL?sslmode=require" -f server\seed_initial_data.sql

Write-Host "Setting user passwords..." -ForegroundColor Cyan
node server\set_initial_passwords.js

Write-Host "✅ User + account seed complete." -ForegroundColor Green
Write-Host "Default login for all users: Welcome2025!"
