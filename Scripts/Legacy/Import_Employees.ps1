# Import-BighornEmployees.ps1
# Auto-imports employees from the CSV located at the project root

Write-Host "Starting Bighorn Portal employee import..." -ForegroundColor Cyan

# Ensure we are in the project directory
Set-Location "C:\BighornPortal_new"

# CSV location
$csvPath = "C:\BighornPortal_new\employees_master.csv"

if (-Not (Test-Path $csvPath)) {
    Write-Host "ERROR: employees_master.csv not found at $csvPath" -ForegroundColor Red
    Write-Host "Place your CSV at C:\BighornPortal_new\employees_master.csv and re-run."
    exit 1
}

Write-Host "CSV found at $csvPath" -ForegroundColor Green
Write-Host "Running importer..." -ForegroundColor Yellow

# Run the Node importer
node server\import_employees.js $csvPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nImport complete!" -ForegroundColor Green
    Write-Host "Default password for imported users: Welcome2025!" -ForegroundColor Yellow
} else {
    Write-Host "`nImport script encountered an error." -ForegroundColor Red
}
