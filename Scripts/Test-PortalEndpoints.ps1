
[CmdletBinding()]
param(
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$endpoints = @("/api/health","/api/users","/api/accounts","/api/invoices","/dashboard","/api/shopify/products")

Write-Host "=== Testing Portal Endpoints at $BaseUrl ===" -ForegroundColor Cyan
foreach ($ep in $endpoints) {
    $url = "$BaseUrl$ep"
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        Write-Host "$ep -> $($r.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "$ep -> ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}
