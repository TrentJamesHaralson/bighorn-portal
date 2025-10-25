param(
  [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$report = "C:\BighornPortal_New\Scripts\endpoint_test_report_full.txt"
if (Test-Path $report) { Remove-Item $report -Force }
New-Item -ItemType File -Path $report | Out-Null

function Ping-Endpoint {
  param([string]$Method, [string]$Url, [hashtable]$Body = $null)
  try {
    if ($Method -eq "GET") {
      $r = Invoke-RestMethod -Method GET -Uri $Url -TimeoutSec 20
    } elseif ($Method -eq "POST") {
      $r = Invoke-RestMethod -Method POST -Uri $Url -Body ($Body | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 20
    } else {
      throw "Unsupported method $Method"
    }
    Add-Content $report "OK $Method $Url"
    return $r
  } catch {
    Add-Content $report "FAIL $Method $Url : $($_.Exception.Message)"
  }
}

Add-Content $report "=== Bighorn Portal Full Endpoint Test ==="

Ping-Endpoint -Method GET -Url "$BaseUrl/api/health"    | Out-Null
Ping-Endpoint -Method GET -Url "$BaseUrl/api/info"      | Out-Null
Ping-Endpoint -Method GET -Url "$BaseUrl/api/accounts"  | Out-Null
Ping-Endpoint -Method GET -Url "$BaseUrl/api/users"     | Out-Null
Ping-Endpoint -Method GET -Url "$BaseUrl/api/invoices"  | Out-Null
Ping-Endpoint -Method GET -Url "$BaseUrl/vouchers"      | Out-Null
Ping-Endpoint -Method GET -Url "$BaseUrl/dashboard"     | Out-Null

Write-Host "Report saved to: $report"
