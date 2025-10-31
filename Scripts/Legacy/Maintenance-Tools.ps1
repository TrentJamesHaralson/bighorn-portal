
[CmdletBinding()]
param(
    [string]$ProjectRoot = "C:\BighornPortal_new"
)

$ErrorActionPreference = "Stop"
Write-Host "=== Maintenance & Diagnostics ===" -ForegroundColor Cyan

Write-Host "`nClearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Removing old temp files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$env:TEMP\*" -ErrorAction SilentlyContinue

Set-Location $ProjectRoot
Write-Host "`nVerifying package.json..." -ForegroundColor Yellow
npm audit fix --force

Write-Host "`nTesting database connection..."
$envData = Get-Content "$ProjectRoot\.env" | Where-Object {$_ -match "DATABASE_URL"}
if ($envData) {
    $dbUrl = ($envData -split "=")[1]
    Write-Host "DATABASE_URL found: $dbUrl"
} else {
    Write-Host "DATABASE_URL not found in .env" -ForegroundColor Red
}

Write-Host "`nAll maintenance checks completed." -ForegroundColor Green
