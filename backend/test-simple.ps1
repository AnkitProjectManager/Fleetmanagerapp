# API Test Script for FleetFlow Backend
Write-Host "Testing FleetFlow Backend APIs..." -ForegroundColor Green

# Test Health Check
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 10
    Write-Host "SUCCESS - Health Check: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "FAILED - Health Check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Root Endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET -TimeoutSec 10
    Write-Host "SUCCESS - Root Endpoint: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "FAILED - Root Endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Auth Login (should fail without credentials but show endpoint works)
try {
    $body = @{ email = "test@example.com"; password = "test" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS - Auth Login: Endpoint accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400 -or $_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "SUCCESS - Auth Login: Endpoint accessible (expected auth failure)" -ForegroundColor Green
    } else {
        Write-Host "FAILED - Auth Login: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Protected Vehicles Endpoint (should return 401)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method GET -TimeoutSec 10
    Write-Host "WARNING - Vehicles Endpoint: Unexpected success (should require auth)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "SUCCESS - Vehicles Endpoint: Correctly requires authentication" -ForegroundColor Green
    } else {
        Write-Host "FAILED - Vehicles Endpoint: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "API Test Complete!" -ForegroundColor Green