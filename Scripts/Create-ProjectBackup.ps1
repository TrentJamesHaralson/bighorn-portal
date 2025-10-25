# === Bighorn Portal Project Packager (Fixed) ===
# Creates a clean ZIP copy of the full project (server, public, uploads, scripts)
# Destination: C:\Auto\BHBOOT-BACKUP\BighornPortal_upload.zip

$src = "C:\BighornPortal_new"
$stage = "$env:TEMP\BighornPortal_stage"
$destDir = "C:\Auto\BHBOOT-BACKUP"
$zip = "$destDir\BighornPortal_upload.zip"

# Ensure destination exists
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

# Clean stage
if (Test-Path $stage) {
    Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy project minus heavy/secret files (robocopy sometimes complains about wildcarded excludes)
robocopy $src $stage /E `
  /XD node_modules .git .vscode `
  /XF .env data.sqlite *.sqlite *.zip > $null

# If the BU-* folder exists, remove it manually (robocopy can't exclude wildcards in folder names)
$buFolder = Join-Path $stage "public"
if (Test-Path $buFolder) {
    Get-ChildItem -Path $buFolder -Directory -Filter "BU-*" -ErrorAction SilentlyContinue |
        ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
}

# Create compressed archive
if (Test-Path $zip) { Remove-Item $zip -Force }
if (!(Test-Path $stage)) { throw "Error: stage directory not found." }

Compress-Archive -Path "$stage\*" -DestinationPath $zip -Force

Write-Host "✅ Backup created successfully:" -ForegroundColor Green
Write-Host "    $zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Upload this zip file here so I can perform full code audit & repair." -ForegroundColor Yellow
