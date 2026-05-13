#!/bin/bash

# MSTY-CRM Docker Quick Start Script (Linux/macOS)
# Usage: chmod +x docker-start.sh && ./docker-start.sh

echo "🚀 MSTY-CRM Docker Deployment"
echo "=============================="

# Check Docker installation
echo ""
echo "📦 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "   Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi
docker_version=$(docker --version)
echo "✅ $docker_version"

# Check Docker Compose
echo ""
echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi
compose_version=$(docker-compose --version)
echo "✅ $compose_version"

# Check if Docker daemon is running
echo ""
echo "🔌 Checking Docker daemon..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker and try again"
    exit 1
fi
echo "✅ Docker daemon is running"

# Check if services are already running
echo ""
echo "🔍 Checking for existing containers..."
if docker-compose ps --services --filter "status=running" 2>/dev/null | grep -q "app"; then
    echo "⚠️  App container is already running"
    read -p "Restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping existing containers..."
        docker-compose down
    else
        echo "ℹ️  Skipping startup. To stop: docker-compose down"
        exit 0
    fi
fi

# Build and start containers
echo ""
echo "🔨 Building Docker image..."
docker-compose build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "▶️  Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Services started"
else
    echo "❌ Failed to start services"
    exit 1
fi

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

max_retries=10
retries=0
healthy=false

while [ $retries -lt $max_retries ] && [ "$healthy" = false ]; do
    if docker-compose ps | grep -q "msty-crm-app.*Up"; then
        healthy=true
        echo "✅ All services are running"
    else
        echo "⏳ Waiting... ($retries/$max_retries)"
        sleep 2
        ((retries++))
    fi
done

if [ "$healthy" = false ]; then
    echo "⚠️  Services may still be starting. Check status with: docker-compose ps"
fi

# Display status
echo ""
echo "📊 Service Status:"
docker-compose ps

# Display access information
echo ""
echo "🎯 Access URLs:"
echo "   CRM Dashboard: http://localhost:3000"
echo "   MongoDB (local): mongodb://localhost:27017"
echo "   Username: mstymainak_db_user"
echo "   Password: Mahesh123"

# Display next steps
echo ""
echo "📝 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Run migration: docker exec msty-crm-app node migrate-wordpress-contacts.js"
echo "   3. Check logs: docker-compose logs -f app"
echo "   4. Stop services: docker-compose down"

echo ""
echo "✅ Deployment complete!"
echo "   For more info, see DOCKER_DEPLOYMENT_GUIDE.md"
