$authFile = "C:\BighornPortal_new\server\routes\auth.js"

Write-Host "Fixing Postgres boolean check in login query..."

if (!(Test-Path $authFile)) {
    Write-Host "ERROR: auth.js not found at expected path." -ForegroundColor Red
    exit 1
}

# read file
$content = Get-Content $authFile -Raw

# replace is_active = 1 with is_active = true (handles spaces and no spaces)
$fixed = $content -replace "is_active\s*=\s*1", "is_active = true"

if ($fixed -ne $content) {
    Set-Content $authFile $fixed -Encoding UTF8
    Write-Host "✅ Login query patched: is_active = true"
} else {
    Write-Host "⚠️ No occurrences found to patch. File may already be correct."
}

Write-Host "Done."
