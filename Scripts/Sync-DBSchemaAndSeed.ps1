# =====================================================
# Bighorn Portal - Sync Database Schema & Seed
# Author: Trent Haralson
# Date: 2025-10-27
# =====================================================

$DBURL = "postgresql://bighornportal_db_user:RPFbbRNiusjleFbKvtySAj1Rr6B11zQ0@dpg-d3rblgripnbc73bojslg-a.oregon-postgres.render.com/bighornportal_db"
$SchemaFile = "C:\BighornPortal_new\server\schema.sql"
$SeedFile = "C:\BighornPortal_new\server\seed_accounts_users.sql"

Write-Host "`n=== Applying Schema ===`n"
psql $DBURL -f $SchemaFile

Write-Host "`n=== Seeding Initial Data ===`n"
psql $DBURL -f $SeedFile

Write-Host "`n=== Verifying Tables ===`n"
psql $DBURL -c "\dt"

Write-Host "`n=== Verifying Account Data ===`n"
psql $DBURL -c "SELECT name, contact_email, created_at FROM corporate_accounts ORDER BY name;"

Write-Host "`n✅ Database Schema & Seed Sync Complete`n"
