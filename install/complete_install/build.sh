#!/bin/bash

# ShelfSpot - Complete Installation Docker Images Build Script
# This script builds Docker images for both frontend and backend components
# Includes additional features for complete installation setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}[SHELFSPOT]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to create .env file if it doesn't exist
create_env_files() {
    print_status "Checking for environment files..."
    
    # Define absolute paths
    BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/backend"
    FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/frontend"
    
    print_status "Backend directory: $BACKEND_DIR"
    print_status "Frontend directory: $FRONTEND_DIR"
    
    # Check for backend .env
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "Backend .env file not found. Creating template..."
        if [ ! -d "$BACKEND_DIR" ]; then
            print_error "Backend directory does not exist: $BACKEND_DIR"
            return 1
        fi
        cat > "$BACKEND_DIR/.env" << EOF
# Database Configuration
DATABASE_URL="mysql://shelfspot_user:ShelfSpot2024!@database:3306/shelfspot?schema=public"

# JWT Configuration
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

# Email Configuration (Resend)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="ShelfSpot <noreply@shelfspot.app>"
ALERT_EMAIL_RECIPIENT="admin@shelfspot.app"

# Application Configuration
NODE_ENV="production"
PORT=3001
EOF
        if [ $? -eq 0 ]; then
            print_success "Backend .env file created successfully"
        else
            print_error "Failed to create backend .env file"
            return 1
        fi
        print_warning "Please update $BACKEND_DIR/.env with your actual configuration"
    else
        print_success "Backend .env file already exists"
    fi
    
    # Check for frontend .env
    if [ ! -f "$FRONTEND_DIR/.env" ]; then
        print_warning "Frontend .env file not found. Creating template..."
        if [ ! -d "$FRONTEND_DIR" ]; then
            print_error "Frontend directory does not exist: $FRONTEND_DIR"
            return 1
        fi
        cat > "$FRONTEND_DIR/.env" << EOF
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Application Configuration
NODE_ENV="production"
PORT=3000
EOF
        if [ $? -eq 0 ]; then
            print_success "Frontend .env file created successfully"
        else
            print_error "Failed to create frontend .env file"
            return 1
        fi
        print_warning "Please update $FRONTEND_DIR/.env with your actual configuration"
    else
        print_success "Frontend .env file already exists"
    fi
}

# Function to build backend image
build_backend() {
    print_status "Building backend Docker image..."
    
    # Use absolute path
    BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/backend"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Build the backend image with build args for no-cache
    local build_args=""
    if [ "$NO_CACHE" = true ]; then
        build_args="--no-cache"
    fi
    
    docker build $build_args -t shelfspot-backend:latest . || {
        print_error "Failed to build backend image"
        exit 1
    }
    
    cd - > /dev/null
    print_success "Backend image built successfully: shelfspot-backend:latest"
}

# Function to build frontend image
build_frontend() {
    print_status "Building frontend Docker image..."
    
    # Use absolute path
    FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/frontend"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Build the frontend image with build args for no-cache
    local build_args=""
    if [ "$NO_CACHE" = true ]; then
        build_args="--no-cache"
    fi
    
    docker build $build_args -t shelfspot-frontend:latest . || {
        print_error "Failed to build frontend image"
        exit 1
    }
    
    cd - > /dev/null
    print_success "Frontend image built successfully: shelfspot-frontend:latest"
}

# Function to pull required third-party images
pull_dependencies() {
    print_status "Pulling required Docker images..."
    
    # Pull MariaDB image
    docker pull mariadb:latest || {
        print_warning "Failed to pull MariaDB image. Will be pulled automatically during docker-compose up."
    }
    
    print_success "Dependencies check completed"
}

# Function to validate docker-compose file
validate_compose() {
    print_status "Validating docker-compose configuration..."
    
    if [ -f "docker-compose.full.yml" ]; then
        docker-compose -f docker-compose.full.yml config >/dev/null || {
            print_error "Invalid docker-compose.full.yml configuration"
            exit 1
        }
        print_success "Docker compose configuration is valid"
    else
        print_error "docker-compose.full.yml not found"
        exit 1
    fi
}

# Function to show system information
show_system_info() {
    print_header "System Information:"
    echo "Docker version: $(docker --version)"
    echo "Docker Compose version: $(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo 'Not available')"
    echo "Available disk space: $(df -h . | awk 'NR==2 {print $4}')"
    echo "Available memory: $(free -h | awk 'NR==2{printf "%.1fG", $7/1024/1024/1024}')"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-only     Build only the backend image"
    echo "  --frontend-only    Build only the frontend image"
    echo "  --no-cache         Build images without using cache"
    echo "  --skip-deps        Skip pulling dependency images"
    echo "  --skip-validation  Skip docker-compose validation"
    echo "  --info             Show system information"
    echo "  --help            Show this help message"
    echo ""
    echo "If no options are provided, both images will be built."
    echo ""
    echo "Examples:"
    echo "  $0                    # Build both frontend and backend"
    echo "  $0 --backend-only     # Build only backend"
    echo "  $0 --no-cache         # Build without cache"
    echo "  $0 --info             # Show system info and exit"
}

# Main script logic
main() {
    local backend_only=false
    local frontend_only=false
    local skip_deps=false
    local skip_validation=false
    export NO_CACHE=false
    
    print_header "ShelfSpot Complete Installation - Docker Build Script"
    
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
                NO_CACHE=true
                shift
                ;;
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --skip-validation)
                skip_validation=true
                shift
                ;;
            --info)
                show_system_info
                exit 0
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
    
    # Show system info
    show_system_info
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_docker
    check_docker_compose
    
    # Create environment files if needed
    create_env_files
    
    # Validate docker-compose file
    if [ "$skip_validation" != true ]; then
        validate_compose
    fi
    
    # Pull dependencies
    if [ "$skip_deps" != true ]; then
        pull_dependencies
    fi
    
    # Add --no-cache warning
    if [ "$NO_CACHE" = true ]; then
        print_warning "Building without cache (this may take significantly longer)"
        export DOCKER_BUILDKIT=1
        export BUILDKIT_PROGRESS=plain
    fi
    
    print_status "Starting ShelfSpot Docker images build process..."
    
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
    docker images | grep -E "(shelfspot-|mariadb)" | head -10
    
    echo ""
    print_header "Next Steps:"
    echo "1. Review and update environment files if needed:"
    echo "   - $(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/backend/.env"
    echo "   - $(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/frontend/.env"
    echo ""
    echo "2. Start the complete application stack:"
    echo "   docker-compose -f docker-compose.full.yml up -d"
    echo ""
    echo "3. Check the application status:"
    echo "   docker-compose -f docker-compose.full.yml ps"
    echo ""
    echo "4. View logs if needed:"
    echo "   docker-compose -f docker-compose.full.yml logs -f"
    echo ""
    print_success "Setup completed! Your ShelfSpot application is ready to run."
}

# Run main function with all arguments
main "$@"
