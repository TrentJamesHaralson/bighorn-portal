$port = 3000
$pid = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($pid) {
    Write-Host "Port $port is in use by PID $pid — killing it..."
    Stop-Process -Id $pid -Force
} else {
    Write-Host "Port $port is free."
}
