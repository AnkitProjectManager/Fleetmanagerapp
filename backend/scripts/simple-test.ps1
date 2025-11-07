# Simple API Test Script
Write-Host "Testing FleetFlow Backend APIs..." -ForegroundColor Green

# Test Health Check
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Health Check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Root Endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET -TimeoutSec 10
    Write-Host "✅ Root Endpoint: SUCCESS" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Root Endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Auth Login (should fail without credentials but show endpoint works)
try {
    $body = @{ email = "test@example.com"; password = "test" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Auth Login: SUCCESS" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400 -or $_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "✅ Auth Login: Endpoint accessible (expected auth failure)" -ForegroundColor Green
    } else {
        Write-Host "❌ Auth Login: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Protected Vehicles Endpoint (should return 401)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method GET -TimeoutSec 10
    Write-Host "⚠️ Vehicles Endpoint: Unexpected success (should require auth)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "✅ Vehicles Endpoint: Correctly requires authentication" -ForegroundColor Green
    } else {
        Write-Host "❌ Vehicles Endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Protected Service Requests Endpoint (should return 401)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/service-requests" -Method GET -TimeoutSec 10
    Write-Host "⚠️ Service Requests Endpoint: Unexpected success (should require auth)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "✅ Service Requests Endpoint: Correctly requires authentication" -ForegroundColor Green
    } else {
        Write-Host "❌ Service Requests Endpoint: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n📊 API Test Complete!" -ForegroundColor Green