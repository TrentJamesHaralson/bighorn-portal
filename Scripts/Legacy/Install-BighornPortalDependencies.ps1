# Install-BighornPortalDependencies.ps1
# Plain ASCII, PowerShell-safe dependency installer for Bighorn Portal

# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Installing Bighorn Portal Dependencies ==="
Write-Host ""

# Project root
$ProjectPath = "C:\BighornPortal_new"
Set-Location $ProjectPath

# Ensure package.json exists
if (!(Test-Path -LiteralPath (Join-Path $ProjectPath "package.json"))) {
    Write-Host "No package.json found. Initializing npm project..."
    npm init -y | Out-Null
}

# Dependencies required by the stabilized backend
$dependencies = @(
    "express",
    "express-session",
    "connect-pg-simple",
    "pg",
    "dotenv",
    "helmet",
    "express-rate-limit",
    "bcryptjs",
    "nodemailer",
    "morgan",
    "uuid",
    "dayjs"
)

Write-Host "Installing dependencies:"
Write-Host ($dependencies -join ", ")
npm install $dependencies --save

Write-Host ""
Write-Host "=== Installation complete ==="
Write-Host ""

# Verify modules exist on disk
Write-Host "Verifying installed modules:"
foreach ($pkg in $dependencies) {
    $pkgPath = Join-Path $ProjectPath ("node_modules\" + $pkg)
    if (Test-Path -LiteralPath $pkgPath) {
        Write-Host ("OK: " + $pkg)
    } else {
        Write-Host ("MISSING: " + $pkg)
    }
}

Write-Host ""
Write-Host "Next:"
Write-Host "  1) node server/server.js"
Write-Host "  2) Visit http://localhost:3000/health"
Write-Host ""
