
[CmdletBinding()]
param(
    [string]$ProjectRoot = "C:\BighornPortal_new",
    [string]$NewHost = "local"
)

$ErrorActionPreference = "Stop"
Write-Host "=== Hosting Migration Tool ===" -ForegroundColor Cyan
Write-Host "Preparing project for host: $NewHost"

Set-Location $ProjectRoot
npm install
Write-Host "Dependencies installed." -ForegroundColor Green

if ($NewHost -eq "local") {
    Write-Host "Local setup complete. Run 'node server/server.js' to start."
} elseif ($NewHost -eq "docker") {
    Write-Host "Generating docker-compose.yml ..."
    $compose = @"
version: '3'
services:
  bighornportal:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=$env:DATABASE_URL
      - SESSION_SECRET=$env:SESSION_SECRET
      - ADMIN_USER=$env:ADMIN_USER
      - ADMIN_PASS=$env:ADMIN_PASS
"@
    Set-Content "$ProjectRoot\docker-compose.yml" $compose
    Write-Host "Docker config generated." -ForegroundColor Green
} elseif ($NewHost -eq "pm2") {
    Write-Host "Setting up PM2 ecosystem file..."
    $pm2 = @"
module.exports = {
  apps: [{
    name: 'bighornportal',
    script: 'server/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
"@
    Set-Content "$ProjectRoot\ecosystem.config.js" $pm2
    Write-Host "PM2 config created." -ForegroundColor Green
} else {
    Write-Host "Unknown host type: $NewHost" -ForegroundColor Red
}
