#!/bin/bash

# ShelfSpot - Docker Images Build Script
# This script builds Docker images for both frontend and backend components

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check environment files
check_env_files() {
    print_status "Checking environment files..."
    
    # Check backend .env
    if [ ! -f "../../backend/.env" ]; then
        print_warning "Backend .env file not found. You need to configure your database connection."
        print_warning "Please create ../../backend/.env with your database configuration."
        print_warning "Example DATABASE_URL: mysql://username:password@hostname:3306/database_name"
        return 1
    fi
    
    # Check frontend .env
    if [ ! -f "../../frontend/.env" ]; then
        print_warning "Frontend .env file not found. Creating basic configuration..."
        cat > "../../frontend/.env" << EOF
# API Configuration
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"

# NextAuth Configuration
NEXTAUTH_SECRET="your_nextauth_secret_change_this"
EOF
        print_success "Frontend .env file created"
    fi
    
    return 0
}

# Function to build backend image
build_backend() {
    print_status "Building backend Docker image..."
    
    if [ ! -d "../../backend" ]; then
        print_error "Backend directory not found. Make sure you're running this from the install/classic_install directory."
        exit 1
    fi
    
    cd ../../backend
    
    # Build the backend image
    docker build -t shelfspot-backend:latest . || {
        print_error "Failed to build backend image"
        exit 1
    }
    
    cd - > /dev/null
    print_success "Backend image built successfully: shelfspot-backend:latest"
}

# Function to build frontend image
build_frontend() {
    print_status "Building frontend Docker image..."
    
    if [ ! -d "../../frontend" ]; then
        print_error "Frontend directory not found. Make sure you're running this from the install/classic_install directory."
        exit 1
    fi
    
    cd ../../frontend
    
    # Build the frontend image
    docker build -t shelfspot-frontend:latest . || {
        print_error "Failed to build frontend image"
        exit 1
    }
    
    cd - > /dev/null
    print_success "Frontend image built successfully: shelfspot-frontend:latest"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-only    Build only the backend image"
    echo "  --frontend-only   Build only the frontend image"
    echo "  --no-cache        Build images without using cache"
    echo "  --help           Show this help message"
    echo ""
    echo "If no options are provided, both images will be built."
}

# Main script logic
main() {
    local backend_only=false
    local frontend_only=false
    local no_cache=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                backend_only=true
                shift
                ;;
            --frontend-only)
                frontend_only=true
                shift
                ;;
            --no-cache)
                no_cache=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate arguments
    if [ "$backend_only" = true ] && [ "$frontend_only" = true ]; then
        print_error "Cannot use --backend-only and --frontend-only together"
        exit 1
    fi
    
    # Add --no-cache to docker build commands if specified
    if [ "$no_cache" = true ]; then
        print_warning "Building without cache (this may take longer)"
        export DOCKER_BUILDKIT=1
        export BUILDKIT_PROGRESS=plain
    fi
    
    print_status "Starting ShelfSpot Docker images build process..."
    
    # Check if Docker is running
    check_docker
    
    # Check environment files
    if ! check_env_files; then
        print_error "Environment configuration required. Please set up your .env files before building."
        exit 1
    fi
    
    # Build images based on options
    if [ "$frontend_only" = true ]; then
        build_frontend
    elif [ "$backend_only" = true ]; then
        build_backend
    else
        # Build both images
        build_backend
        build_frontend
    fi
    
    print_success "Build process completed successfully!"
    
    # Show built images
    print_status "Built images:"
    docker images | grep "shelfspot-" | head -10
    
    echo ""
    print_status "Next steps:"
    echo "1. Make sure your database is running and accessible"
    echo "2. Verify your environment configuration in:"
    echo "   - ../../backend/.env (database connection)"
    echo "   - ../../frontend/.env (API configuration)"
    echo "3. Start the application: docker-compose up -d"
    echo "4. Check logs if needed: docker-compose logs -f"
    echo ""
    print_status "The application will be available at:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
}

# Run main function with all arguments
main "$@"
