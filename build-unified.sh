#!/bin/bash

# ShelfSpot Unified Container Build Script

set -e

echo "🚀 Building ShelfSpot Unified Container..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env files exist
if [ ! -f "./backend/.env" ]; then
    print_warning "Backend .env file not found. Please create ./backend/.env with your configuration."
fi

if [ ! -f "./frontend/.env" ]; then
    print_warning "Frontend .env file not found. Please create ./frontend/.env with your configuration."
fi

# Build the unified container
print_status "Building unified Docker image..."
docker build -t shelfspot-unified .

if [ $? -eq 0 ]; then
    print_status "✅ Build successful!"
    
    echo ""
    print_status "🎉 ShelfSpot unified container is ready!"
    echo ""
    echo "To run the container:"
    echo "  docker-compose -f docker-compose.unified.yml up -d"
    echo ""
    echo "Or run directly:"
    echo "  docker run -d --name shelfspot -p 3000:3000 --env-file ./backend/.env --env-file ./frontend/.env shelfspot-unified"
    echo ""
    echo "The application will be available at: http://localhost:3000"
    echo "Both frontend and backend are running inside the same container."
else
    print_error "❌ Build failed!"
    exit 1
fi
