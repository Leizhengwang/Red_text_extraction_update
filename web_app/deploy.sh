#!/bin/bash

# ABS Rules Red Text Extractor - Deployment Script

echo "🚀 Starting deployment of ABS Rules Red Text Extractor..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads output logs

# Set proper permissions
chmod 755 uploads output
chmod 644 requirements.txt

# Build and start the application
echo "🔨 Building Docker image..."
docker-compose build

echo "🏃 Starting the application..."
docker-compose up -d

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:5000/ > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access the application at: http://localhost:5000"
    echo ""
    echo "📊 Application Status:"
    docker-compose ps
    echo ""
    echo "📋 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "🔄 To restart: docker-compose restart"
else
    echo "❌ Application failed to start. Checking logs..."
    docker-compose logs
    exit 1
fi

echo "🎉 Deployment completed successfully!"