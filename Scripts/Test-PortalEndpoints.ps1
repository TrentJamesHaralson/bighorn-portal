# Test-PortalEndpoints.ps1
# Automated endpoint verification for Bighorn Portal
# ---------------------------------------------------
# This script checks all major API routes and records response status.

$baseUrl = "http://localhost:3000"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportPath = "C:\BighornPortal_new\Scripts\endpoint_test_report_$timestamp.txt"

$endpoints = @(
    "/api/health",
    "/api/info",
    "/api/users",
    "/api/accounts",
    "/api/invoices",
    "/vouchers",
    "/dashboard"
)

"=== Bighorn Portal Endpoint Test Report ($timestamp) ===" | Out-File $reportPath

foreach ($ep in $endpoints) {
    $url = "$baseUrl$ep"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $status = $response.StatusCode
        $result = if ($status -eq 200) { "OK" } else { "WARN ($status)" }
        Write-Host "✔ $ep - $result" -ForegroundColor Green
        "✔ $ep - $result ($status)" | Out-File $reportPath -Append
    }
    catch {
        Write-Host "✖ $ep - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        "✖ $ep - ERROR: $($_.Exception.Message)" | Out-File $reportPath -Append
    }
}

"`nReport saved to: $reportPath" | Out-File $reportPath -Append
Write-Host "`nReport saved to: $reportPath" -ForegroundColor Cyan
