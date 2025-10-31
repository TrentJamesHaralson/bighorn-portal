
[CmdletBinding()]
param(
    [string]$ProjectRoot = "C:\BighornPortal_new",
    [string]$BackupDir = "C:\Auto\BHBOOT-BACKUP"
)

$ErrorActionPreference = "Stop"
if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $BackupDir "BighornPortal_$timestamp.zip"

Write-Host "Creating backup archive..." -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($ProjectRoot, $zipPath)

Write-Host "Backup created at $zipPath" -ForegroundColor Green
