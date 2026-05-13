#!/usr/bin/env powershell

# MSTY-CRM Docker Quick Start Script (Windows PowerShell)
# Usage: .\docker-start.ps1

Write-Host "🚀 MSTY-CRM Docker Deployment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Check Docker installation
Write-Host "`n📦 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

# Check if Docker daemon is running
Write-Host "`n🔌 Checking Docker daemon..." -ForegroundColor Yellow
try {
    docker ps > $null 2>&1
    Write-Host "✅ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker daemon is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if services are already running
Write-Host "`n🔍 Checking for existing containers..." -ForegroundColor Yellow
$runningApp = docker-compose ps --services --filter "status=running" 2>$null | Select-String "app"
if ($runningApp) {
    Write-Host "⚠️  App container is already running" -ForegroundColor Yellow
    $choice = Read-Host "Restart? (y/n)"
    if ($choice -eq 'y') {
        Write-Host "Stopping existing containers..." -ForegroundColor Yellow
        docker-compose down
    } else {
        Write-Host "ℹ️  Skipping startup. To stop: docker-compose down" -ForegroundColor Cyan
        exit 0
    }
}

# Build and start containers
Write-Host "`n🔨 Building Docker image..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n▶️  Starting services..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`n⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxRetries = 10
$retries = 0
$healthy = $false

while ($retries -lt $maxRetries -and -not $healthy) {
    $status = docker-compose ps --format json | ConvertFrom-Json
    $appHealthy = $status | Where-Object { $_.Service -eq "app" } | Select-Object -First 1
    $mongoHealthy = $status | Where-Object { $_.Service -eq "mongodb" } | Select-Object -First 1
    
    if ($null -ne $appHealthy -and $null -ne $mongoHealthy) {
        $healthy = $true
        Write-Host "✅ All services are running" -ForegroundColor Green
    } else {
        Write-Host "⏳ Waiting... ($retries/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $retries++
    }
}

if (-not $healthy) {
    Write-Host "⚠️  Services may still be starting. Check status with: docker-compose ps" -ForegroundColor Yellow
}

# Display status
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

# Display access information
Write-Host "`n🎯 Access URLs:" -ForegroundColor Cyan
Write-Host "   CRM Dashboard: http://localhost:3000" -ForegroundColor Green
Write-Host "   MongoDB (local): mongodb://localhost:27017" -ForegroundColor Green
Write-Host "   Username: mstymainak_db_user" -ForegroundColor Green
Write-Host "   Password: Mahesh123" -ForegroundColor Green

# Display next steps
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   2. Run migration: docker exec msty-crm-app node migrate-wordpress-contacts.js" -ForegroundColor White
Write-Host "   3. Check logs: docker-compose logs -f app" -ForegroundColor White
Write-Host "   4. Stop services: docker-compose down" -ForegroundColor White

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "   For more info, see DOCKER_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
