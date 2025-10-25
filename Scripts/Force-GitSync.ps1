# =====================================================================
# Force-GitSync.ps1
# Performs a full clean Git re-sync and force-push to GitHub
# =====================================================================

$projectDir = "C:\BighornPortal_new"
$repoURL = "https://github.com/TrentJamesHaralson/bighorn-portal.git"

Write-Host "=== Bighorn Portal Git Force Sync ===" -ForegroundColor Cyan

# Move into project directory
Set-Location $projectDir

# Ensure .gitignore exists
if (!(Test-Path "$projectDir\.gitignore")) {
    @"
node_modules/
.env
*.sqlite
uploads/
public/BU-*
"@ | Out-File "$projectDir\.gitignore" -Encoding utf8
    Write-Host "Created default .gitignore" -ForegroundColor Yellow
}

# Step 1 - Remove any cached Git index or bad metadata
if (Test-Path "$projectDir\.git") {
    Write-Host "Removing existing Git cache..." -ForegroundColor Yellow
    Remove-Item "$projectDir\.git" -Recurse -Force -ErrorAction SilentlyContinue
}

# Step 2 - Reinitialize Git repo
Write-Host "Reinitializing Git repository..." -ForegroundColor Yellow
git init | Out-Null
git branch -M main

# Step 3 - Reconnect remote origin
Write-Host "Connecting to remote repository..." -ForegroundColor Yellow
git remote add origin $repoURL

# Step 4 - Stage all project files
Write-Host "Staging all project files..." -ForegroundColor Yellow
git add .

# Step 5 - Commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Full force sync commit - $timestamp"

# Step 6 - Force push to GitHub
Write-Host "Pushing to GitHub (force overwrite)..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host ""
Write-Host "✅ Full sync completed successfully!" -ForegroundColor Green
Write-Host "Check GitHub for updated code: $repoURL" -ForegroundColor Cyan
