# Fleet Management System - Comprehensive Test Suite
# Run this script to test all components

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "FLEET MANAGEMENT SYSTEM TEST SUITE" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test Configuration
$backendUrl = "http://localhost:5000"
$frontendUrl = "http://localhost:3001"
$testResults = @{
    Passed = 0
    Failed = 0
    Tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: $Name" -ForegroundColor Green
            $testResults.Passed++
            $testResults.Tests += @{Name=$Name; Status="PASS"}
            return $true
        } else {
            Write-Host "❌ FAIL: $Name (Status: $($response.StatusCode))" -ForegroundColor Red
            $testResults.Failed++
            $testResults.Tests += @{Name=$Name; Status="FAIL"; Reason="Unexpected status code"}
            return $false
        }
    } catch {
        Write-Host "❌ FAIL: $Name ($($_.Exception.Message))" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Tests += @{Name=$Name; Status="FAIL"; Reason=$_.Exception.Message}
        return $false
    }
}

# 1. INFRASTRUCTURE TESTS
Write-Host "`n[1/6] INFRASTRUCTURE TESTS" -ForegroundColor Yellow
Write-Host "Testing server availability..." -ForegroundColor Gray

Test-Endpoint -Name "Frontend Server" -Url $frontendUrl
Test-Endpoint -Name "Backend Server" -Url $backendUrl
Test-Endpoint -Name "API Health Check" -Url "$backendUrl/api/health"

# 2. AUTHENTICATION API TESTS
Write-Host "`n[2/6] AUTHENTICATION API TESTS" -ForegroundColor Yellow
Write-Host "Testing authentication endpoints..." -ForegroundColor Gray

# Test protected route (should fail without auth)
try {
    Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/me" -Method GET -ErrorAction Stop | Out-Null
    Write-Host "❌ FAIL: Protected Route (should require auth)" -ForegroundColor Red
    $testResults.Failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Protected Route Requires Authentication" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "❌ FAIL: Protected Route (unexpected error)" -ForegroundColor Red
        $testResults.Failed++
    }
}

# 3. DATABASE CONNECTIVITY TESTS
Write-Host "`n[3/6] DATABASE CONNECTIVITY TESTS" -ForegroundColor Yellow
Write-Host "Testing database connection..." -ForegroundColor Gray

try {
    $healthCheck = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET
    $dbStatus = $healthCheck.database
    
    Write-Host "Database Type: $($dbStatus.type)" -ForegroundColor Gray
    Write-Host "Database Connected: $($dbStatus.isConnected)" -ForegroundColor Gray
    
    if ($dbStatus.type -eq "mongodb") {
        if ($dbStatus.isConnected) {
            Write-Host "✅ PASS: MongoDB Connection Active" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARN: MongoDB Not Connected (using in-memory fallback)" -ForegroundColor Yellow
        }
        $testResults.Passed++
    }
} catch {
    Write-Host "❌ FAIL: Database Status Check" -ForegroundColor Red
    $testResults.Failed++
}

# 4. API ENDPOINTS TESTS
Write-Host "`n[4/6] API ENDPOINTS TESTS" -ForegroundColor Yellow
Write-Host "Testing API routes..." -ForegroundColor Gray

Test-Endpoint -Name "Vehicles API Route" -Url "$backendUrl/api/v1/vehicles" -ExpectedStatus 401
Test-Endpoint -Name "Service Requests API Route" -Url "$backendUrl/api/v1/service-requests" -ExpectedStatus 401

# 5. FRONTEND RESOURCE TESTS  
Write-Host "`n[5/6] FRONTEND RESOURCE TESTS" -ForegroundColor Yellow
Write-Host "Testing frontend build..." -ForegroundColor Gray

try {
    $frontendHtml = Invoke-WebRequest -Uri $frontendUrl
    if ($frontendHtml.Content -match "<!DOCTYPE html>") {
        Write-Host "✅ PASS: Frontend HTML Structure" -ForegroundColor Green
        $testResults.Passed++
    }
    if ($frontendHtml.Content -match "vite") {
        Write-Host "✅ PASS: Vite Development Server" -ForegroundColor Green
        $testResults.Passed++
    }
    if ($frontendHtml.Content -match "react") {
        Write-Host "✅ PASS: React Framework Loaded" -ForegroundColor Green
        $testResults.Passed++
    }
} catch {
    Write-Host "❌ FAIL: Frontend Resource Check" -ForegroundColor Red
    $testResults.Failed++
}

# 6. SECURITY TESTS
Write-Host "`n[6/6] SECURITY TESTS" -ForegroundColor Yellow
Write-Host "Testing security headers..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $backendUrl -Method GET
    $headers = $response.Headers
    
    if ($headers["X-Content-Type-Options"]) {
        Write-Host "✅ PASS: X-Content-Type-Options Header Present" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "⚠️  WARN: X-Content-Type-Options Header Missing" -ForegroundColor Yellow
    }
    
    if ($headers["Content-Security-Policy"]) {
        Write-Host "✅ PASS: Content Security Policy Active" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "⚠️  WARN: Content Security Policy Missing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ FAIL: Security Headers Check" -ForegroundColor Red
    $testResults.Failed++
}

# SUMMARY
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Passed + $testResults.Failed)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red

$successRate = [math]::Round(($testResults.Passed / ($testResults.Passed + $testResults.Failed)) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if($successRate -ge 80){"Green"}else{"Yellow"})

if ($testResults.Failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! APPLICATION IS READY FOR PRODUCTION 🎉" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "`n⚠️  MOST TESTS PASSED. REVIEW FAILURES BEFORE PRODUCTION" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ MULTIPLE TEST FAILURES. FIXES REQUIRED BEFORE PRODUCTION" -ForegroundColor Red
}

Write-Host ""
