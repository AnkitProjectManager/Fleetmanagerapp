# Simple FleetFlow Status Check
Write-Host "FleetFlow System Status Check" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Backend Health Check
Write-Host "Testing Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend API: RUNNING on port 5000" -ForegroundColor Green
    Write-Host "  Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend API: OFFLINE" -ForegroundColor Red
}

# Frontend Check
Write-Host "Testing Frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ Frontend: RUNNING on port 5173" -ForegroundColor Green
} catch {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ Frontend: RUNNING on port 3000" -ForegroundColor Green
    } catch {
        Write-Host "✗ Frontend: OFFLINE" -ForegroundColor Red
    }
}

# API Endpoint Tests
Write-Host "Testing API Endpoints..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method GET -TimeoutSec 5
    Write-Host "! Vehicles endpoint is not protected" -ForegroundColor Yellow
} catch {
    Write-Host "✓ Vehicles endpoint requires authentication" -ForegroundColor Green
}

Write-Host "Status check complete!" -ForegroundColor Green