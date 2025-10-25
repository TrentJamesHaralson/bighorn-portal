$publicPath = "C:\BighornPortal_New\public"

Write-Host "=== Verifying Bighorn Portal Frontend Structure ===" -ForegroundColor Cyan

# Required core files
$coreFiles = @("styles.css", "js\main.js")
$missing = @()

foreach ($file in $coreFiles) {
    $full = Join-Path $publicPath $file
    if (-not (Test-Path $full)) {
        Write-Warning "Missing: $file"
        $missing += $file
    } else {
        Write-Host "Found: $file" -ForegroundColor Green
    }
}

# Check all .html files for missing or bad image/CSS paths
$htmlFiles = Get-ChildItem "$publicPath" -Filter *.html
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName
    if ($content -match "images/") {
        if (-not (Test-Path "$publicPath\images")) {
            Write-Warning "⚠ '$($file.Name)' references images/, but images/ folder missing."
        }
    }
    if ($content -match "styles.css" -and -not (Test-Path "$publicPath\styles.css")) {
        Write-Warning "⚠ '$($file.Name)' references styles.css but file not found."
    }
}

if ($missing.Count -eq 0) {
    Write-Host "`nAll assets verified successfully!" -ForegroundColor Green
} else {
    Write-Host "`nMissing assets detected:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
}
