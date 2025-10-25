$BaseUrl = "http://localhost:3000/api/users"
$Report = "C:\BighornPortal_new\Scripts\user_module_test_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').txt"
Write-Host "=== Bighorn Portal User API Test ===" -ForegroundColor Cyan

function Write-Result($label, $success, $data = "") {
    $color = if ($success) { "Green" } else { "Red" }
    $status = if ($success) { "OK" } else { "FAIL" }
    Write-Host ("{0,-25} {1}" -f $label, $status) -ForegroundColor $color
    if ($data) { Add-Content -Path $Report -Value ("$label: $data") }
}

try {
    $users = Invoke-RestMethod -Uri $BaseUrl -Method GET
    $count = if ($users -is [array]) { $users.Count } else { 1 }
    Write-Result "GET /api/users", $true, "Found $count user(s)"
}
catch { Write-Result "GET /api/users", $false, $_.Exception.Message }

try {
    $payload = @{
        email = "apitest_$(Get-Random)@bighorn.local"
        password_hash = "placeholderhash123"
        role = "EMPLOYEE"
        is_active = $true
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri $BaseUrl -Method POST -Body $payload -ContentType "application/json"
    $UserId = $response.id
    Write-Result "POST /api/users", $true, "Created $UserId"
}
catch { Write-Result "POST /api/users", $false, $_.Exception.Message }

if ($UserId) {
    try {
        $update = @{ role = "MANAGER"; is_active = $false } | ConvertTo-Json
        Invoke-RestMethod -Uri "$BaseUrl/$UserId" -Method PUT -Body $update -ContentType "application/json" | Out-Null
        Write-Result "PUT /api/users/$UserId", $true, "Updated role to MANAGER"
    }
    catch { Write-Result "PUT /api/users/$UserId", $false, $_.Exception.Message }

    try {
        Invoke-RestMethod -Uri "$BaseUrl/$UserId" -Method DELETE | Out-Null
        Write-Result "DELETE /api/users/$UserId", $true, "User deleted successfully"
    }
    catch { Write-Result "DELETE /api/users/$UserId", $false, $_.Exception.Message }
}

Write-Host "`nReport saved to: $Report" -ForegroundColor Cyan
