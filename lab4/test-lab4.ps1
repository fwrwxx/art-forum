# test-lab4.ps1
$baseUrl = "http://localhost:3000"
$projectPath = "D:\kpi\web-be\lab1\art-forum\lab4"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ArtHub Lab4 - API Testing" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1] Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/status/health" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  [OK] Status: $($data.status)" -ForegroundColor Green
    Write-Host "  [OK] Uptime: $($data.uptime.formatted)" -ForegroundColor Green
    Write-Host "  [OK] Memory: $($data.memory.heapUsed)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $_" -ForegroundColor Red
}

# Test 2: Server Status
Write-Host "`n[2] Server Status" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/status" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  [OK] Node version: $($data.data.server.node_version)" -ForegroundColor Green
    Write-Host "  [OK] Platform: $($data.data.server.platform)" -ForegroundColor Green
    Write-Host "  [OK] CPU Cores: $($data.data.cpu.cores)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $_" -ForegroundColor Red
}

# Test 3: Home
Write-Host "`n[3] Home Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  [OK] Server: $($data.name)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $_" -ForegroundColor Red
}

# Test 4: List files (before upload)
Write-Host "`n[4] List files (before upload)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/upload/list" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  [OK] Files count: $($data.count)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $_" -ForegroundColor Red
}

# Test 5: Upload file (using curl.exe)
Write-Host "`n[5] Upload file (should be rejected for .txt)" -ForegroundColor Yellow
# Create test file
"test content" | Out-File -FilePath "$projectPath\test.txt" -Encoding utf8

try {
    $result = curl.exe -s -X POST "$baseUrl/api/upload/single" -F "file=@$projectPath\test.txt"
    Write-Host "  Response: $result" -ForegroundColor Gray
    Write-Host "  [WARN] File uploaded (txt files are not allowed - should be rejected)" -ForegroundColor Yellow
} catch {
    Write-Host "  [FAIL] Upload failed: $_" -ForegroundColor Red
}

# Test 6: Check logs
Write-Host "`n[6] Check logs" -ForegroundColor Yellow
$logPath = "$projectPath\logs\combined.log"
if (Test-Path $logPath) {
    $logLines = Get-Content $logPath -Tail 5
    Write-Host "  [OK] Last 5 log entries:" -ForegroundColor Green
    foreach ($line in $logLines) {
        Write-Host "     $line" -ForegroundColor Gray
    }
} else {
    Write-Host "  [WARN] Log file not found: $logPath" -ForegroundColor Yellow
    Write-Host "  Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$projectPath\logs" | Out-Null
}

# Test 7: Metrics
Write-Host "`n[7] Metrics Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/status/metrics" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  [OK] Metrics retrieved" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $_" -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Testing completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan