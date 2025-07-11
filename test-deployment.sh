#!/bin/bash

# Test deployment script
# This script tests the Docker deployment locally

set -e

echo "🚀 Testing Event Slider Docker Deployment"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found in current directory"
    exit 1
fi

echo "✅ docker-compose.yml found"

# Clean up any existing containers
echo "🧹 Cleaning up any existing containers..."
docker compose down > /dev/null 2>&1 || true

# Build and start services
echo "🔨 Building and starting services..."
docker compose up --build -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker compose ps

# Test if WebSocket server is responding
echo "🔌 Testing WebSocket server..."
if curl -f -s "http://localhost:8081" > /dev/null 2>&1; then
    echo "✅ WebSocket server is responding"
else
    echo "⚠️  WebSocket server might not be ready yet (this is normal for WebSocket servers)"
fi

# Test if UI is responding
echo "🌐 Testing UI server..."
if curl -f -s "http://localhost:3000" > /dev/null 2>&1; then
    echo "✅ UI server is responding"
else
    echo "⚠️  UI server might not be ready yet"
fi

echo ""
echo "🎉 Deployment test completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Visit http://localhost:3000 to see the UI"
echo "  2. Run './docker-manager.sh ws-console' to access WebSocket CLI"
echo "  3. Run './docker-manager.sh logs' to see application logs"
echo "  4. Run './docker-manager.sh stop' to stop services"
echo ""
echo "💡 Available management commands:"
echo "  ./docker-manager.sh dev      # Start development mode"
echo "  ./docker-manager.sh prod     # Start production mode"
echo "  ./docker-manager.sh ws-console # Connect to WebSocket CLI"
echo "  ./docker-manager.sh logs     # View logs"
echo "  ./docker-manager.sh stop     # Stop services"
