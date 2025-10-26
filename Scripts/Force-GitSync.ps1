
[CmdletBinding()]
param(
    [string]$ProjectRoot = "C:\BighornPortal_new",
    [string]$RepoUrl = "https://github.com/TrentJamesHaralson/bighorn-portal.git"
)

$ErrorActionPreference = "Stop"
Write-Host "=== Force Git Sync: Bighorn Portal ===" -ForegroundColor Cyan

Set-Location $ProjectRoot

if (!(Test-Path ".git")) {
    Write-Host "Initializing new Git repository..." -ForegroundColor Yellow
    git init
    git remote add origin $RepoUrl
}

git add .
$commitMsg = "Automated sync from PowerShell on 2025-10-26 04:54:28"
git commit -m $commitMsg
git branch -M main

Write-Host "Force pushing to GitHub..." -ForegroundColor Yellow
git push origin main --force

Write-Host "Sync complete. Render will auto-deploy." -ForegroundColor Green
