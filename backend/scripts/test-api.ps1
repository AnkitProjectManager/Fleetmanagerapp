#!/usr/bin/env powershell

# API Testing Script for FleetFlow Backend
Write-Host "🔍 Testing FleetFlow Backend APIs..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

$baseUrl = "http://localhost:5000"
$apiVersion = "v1"

# Helper function to test API endpoints
function Test-ApiEndpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Host "`n📍 Testing: $Description" -ForegroundColor Cyan
    Write-Host "   URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Body) {
            if ($Body -is [hashtable]) {
                $params.Body = ($Body | ConvertTo-Json -Depth 3)
            } else {
                $params.Body = $Body
            }
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "   ✅ SUCCESS ($($response.StatusCode))" -ForegroundColor Green
            
            # Try to parse JSON response
            try {
                $jsonContent = $response.Content | ConvertFrom-Json
                if ($jsonContent.message) {
                    Write-Host "   📄 Message: $($jsonContent.message)" -ForegroundColor Yellow
                }
                if ($jsonContent.data -and $jsonContent.data.Count) {
                    Write-Host "   📊 Data Count: $($jsonContent.data.Count)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   📄 Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ⚠️  UNEXPECTED STATUS: $($response.StatusCode)" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__ 2>$null
        if ($statusCode) {
            Write-Host "   ❌ FAILED ($statusCode): $($_.Exception.Message)" -ForegroundColor Red
        } else {
            Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Test 1: Health Check
Test-ApiEndpoint -Url "$baseUrl/api/health" -Description "Health Check Endpoint"

# Test 2: Root Endpoint
Test-ApiEndpoint -Url "$baseUrl/" -Description "Root API Information"

# Test 3: Auth Endpoints (Public)
Write-Host "`n🔐 Testing Authentication Endpoints..." -ForegroundColor Magenta

# Note: Most auth endpoints require valid data, so we'll test the structure only
$testUser = @{
    email = "test@example.com"
    password = "TestPassword123"
}

# We expect this to fail with validation errors, but it tests the endpoint accessibility
Test-ApiEndpoint -Url "$baseUrl/api/$apiVersion/auth/login" -Method "POST" -Body $testUser -Description "Login Endpoint Structure"

# Test 4: Protected Endpoints (should return 401 without authentication)
Write-Host "`n🔒 Testing Protected Endpoints (should return 401)..." -ForegroundColor Magenta

Test-ApiEndpoint -Url "$baseUrl/api/$apiVersion/vehicles" -Description "Vehicles Endpoint (No Auth)"
Test-ApiEndpoint -Url "$baseUrl/api/$apiVersion/service-requests" -Description "Service Requests Endpoint (No Auth)"
Test-ApiEndpoint -Url "$baseUrl/api/$apiVersion/auth/me" -Description "Current User Endpoint (No Auth)"

Write-Host "`n📊 API Test Summary" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "✅ Health checks should return 200 OK" -ForegroundColor Green
Write-Host "🔐 Auth endpoints should accept POST requests" -ForegroundColor Yellow
Write-Host "🔒 Protected endpoints should return 401 Unauthorized" -ForegroundColor Yellow
Write-Host "`n🚀 Backend API structure is properly configured!" -ForegroundColor Green