# Kill-Port3000.ps1
$port = 3000
$pid = (netstat -ano | findstr ":$port" | Select-String "LISTENING" | ForEach-Object {
    ($_ -split '\s+')[-1]
})
if ($pid) {
    taskkill /PID $pid /F
    Write-Host "Port $port freed (PID $pid killed)."
} else {
    Write-Host "Port $port already free."
}
