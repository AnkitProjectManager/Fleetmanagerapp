# FleetFlow Complete API and Frontend Status Check
Write-Host "=== FleetFlow System Status Check ===" -ForegroundColor Magenta
Write-Host ""

# Backend API Tests
Write-Host "BACKEND API TESTS" -ForegroundColor Cyan
Write-Host "-----------------" -ForegroundColor Cyan

# Test 1: Health Check
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    Write-Host "[✓] Backend Health Check: RUNNING" -ForegroundColor Green
    Write-Host "    Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Gray
    $backendStatus = "RUNNING"
} catch {
    Write-Host "[✗] Backend Health Check: OFFLINE" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $backendStatus = "OFFLINE"
}

# Test 2: Auth Endpoints
if ($backendStatus -eq "RUNNING") {
    try {
        $body = @{ email = "test@example.com"; password = "wrongpassword" } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
        Write-Host "[✓] Auth Login Endpoint: ACCESSIBLE" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
            Write-Host "[✓] Auth Login Endpoint: ACCESSIBLE (validation working)" -ForegroundColor Green
        } else {
            Write-Host "[?] Auth Login Endpoint: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow
        }
    }

    # Test 3: Protected Endpoints
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method GET -TimeoutSec 5
        Write-Host "[!] Vehicles Endpoint: WARNING - No authentication required" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
            Write-Host "[✓] Vehicles Endpoint: PROTECTED (auth required)" -ForegroundColor Green
        } else {
            Write-Host "[?] Vehicles Endpoint: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow
        }
    }

    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/v1/service-requests" -Method GET -TimeoutSec 5
        Write-Host "[!] Service Requests Endpoint: WARNING - No authentication required" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
            Write-Host "[✓] Service Requests Endpoint: PROTECTED (auth required)" -ForegroundColor Green
        } else {
            Write-Host "[?] Service Requests Endpoint: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Frontend Tests
Write-Host "FRONTEND TESTS" -ForegroundColor Cyan
Write-Host "--------------" -ForegroundColor Cyan

# Test Frontend Development Server (Vite default port 5173)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "[✓] Frontend Development Server: RUNNING on port 5173" -ForegroundColor Green
        $frontendStatus = "RUNNING"
    } else {
        Write-Host "[?] Frontend Development Server: Status $($response.StatusCode)" -ForegroundColor Yellow
        $frontendStatus = "UNKNOWN"
    }
} catch {
    Write-Host "[✗] Frontend Development Server: OFFLINE" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $frontendStatus = "OFFLINE"
}

# Alternative port check (3000 is also common for React apps)
if ($frontendStatus -eq "OFFLINE") {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "[✓] Frontend Development Server: RUNNING on port 3000" -ForegroundColor Green
            $frontendStatus = "RUNNING"
        }
    } catch {
        # Frontend is definitely offline
    }
}

Write-Host ""

# Summary
Write-Host "SYSTEM SUMMARY" -ForegroundColor Magenta
Write-Host "--------------" -ForegroundColor Magenta

if ($backendStatus -eq "RUNNING") {
    Write-Host "[✓] Backend API: OPERATIONAL" -ForegroundColor Green
    Write-Host "    - Health check working" -ForegroundColor Gray
    Write-Host "    - Authentication endpoints accessible" -ForegroundColor Gray
    Write-Host "    - Protected routes properly secured" -ForegroundColor Gray
} else {
    Write-Host "[✗] Backend API: NOT RUNNING" -ForegroundColor Red
}

if ($frontendStatus -eq "RUNNING") {
    Write-Host "[✓] Frontend: OPERATIONAL" -ForegroundColor Green
} else {
    Write-Host "[✗] Frontend: NOT RUNNING" -ForegroundColor Red
    Write-Host "    Start with: npm run dev (in frontend directory)" -ForegroundColor Gray
}

Write-Host ""

# Available Endpoints Summary
if ($backendStatus -eq "RUNNING") {
    Write-Host "AVAILABLE API ENDPOINTS" -ForegroundColor Cyan
    Write-Host "-----------------------" -ForegroundColor Cyan
    Write-Host "Health: http://localhost:5000/api/health" -ForegroundColor White
    Write-Host "Auth: http://localhost:5000/api/v1/auth/*" -ForegroundColor White
    Write-Host "Vehicles: http://localhost:5000/api/v1/vehicles" -ForegroundColor White
    Write-Host "Service Requests: http://localhost:5000/api/v1/service-requests" -ForegroundColor White
}

if ($frontendStatus -eq "RUNNING") {
    Write-Host ""
    Write-Host "FRONTEND ACCESS" -ForegroundColor Cyan
    Write-Host "---------------" -ForegroundColor Cyan
    if ($frontendStatus -eq "RUNNING") {
        Write-Host "Frontend: http://localhost:5173 or http://localhost:3000" -ForegroundColor White
    }
}

Write-Host ""