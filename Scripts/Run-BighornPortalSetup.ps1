
[CmdletBinding()]
param(
    [string]$ProjectRoot = "C:\BighornPortal_new",
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
Write-Host "=== Bighorn Portal Automated Setup ===" -ForegroundColor Cyan

# Stop node/npm
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Verify structure
if (!(Test-Path $ProjectRoot)) { throw "Project root not found." }
if (!(Test-Path "$ProjectRoot\.env")) { throw ".env missing." }
if (!(Test-Path "$ProjectRoot\server\server.js")) { throw "server.js missing." }
Write-Host "Project structure verified." -ForegroundColor Green

# Install dependencies
Set-Location $ProjectRoot
npm install node-fetch@2 --save
npm install

# Launch server for smoke tests
$node = Start-Process "node" "server/server.js" -PassThru
Start-Sleep -Seconds 10

$tests = @("/api/health","/dashboard","/api/shopify/products")
foreach ($p in $tests) {
    $url = "$BaseUrl$p"
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        Write-Host ("0 -> 1" -f $url, $resp.StatusCode) -ForegroundColor Green
    } catch {
        Write-Host ("0 -> ERROR (1)" -f $url, $_.Exception.Message) -ForegroundColor Red
    }
}
Stop-Process -Id $node.Id -Force

# Offer backup & push
$backupScript = "$ProjectRoot\Scripts\Create-ProjectBackup.ps1"
$gitSync = "$ProjectRoot\Scripts\Force-GitSync.ps1"

Write-Host "`nBackup before push? (Y/N)"
if ((Read-Host) -match '^[Yy]') { & $backupScript }
Write-Host "`nPush to Render now? (Y/N)"
if ((Read-Host) -match '^[Yy]') { & $gitSync }
