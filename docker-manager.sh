#!/bin/bash

# Event Slider Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Build images
build() {
    log_info "Building Docker images..."
    docker compose build
    log_success "Images built successfully!"
}

# Start development environment
dev() {
    log_info "Starting development environment..."
    check_docker
    
    # Stop any running containers
    docker compose down
    
    # Start development services
    docker compose up -d ui websocket-server
    
    log_success "Development environment started!"
    log_info "UI available at: http://localhost:3000"
    log_info "WebSocket server at: wss://localhost:8081"
    
    # Follow logs
    log_info "Following logs (Ctrl+C to stop)..."
    docker compose logs -f
}

# Start production environment
prod() {
    log_info "Starting production environment..."
    check_docker
    
    # Stop any running containers
    docker compose down
    
    # Build production images
    log_info "Building production images..."
    docker compose build ui-prod websocket-server
    
    # Start production services
    docker compose --profile production up -d
    
    log_success "Production environment started!"
    log_info "UI available at: http://localhost:80"
    log_info "WebSocket server at: wss://localhost:8081"
}

# Stop all services
stop() {
    log_info "Stopping all services..."
    docker compose down
    log_success "All services stopped!"
}

# View logs
logs() {
    service=${2:-""}
    if [ -n "$service" ]; then
        log_info "Showing logs for $service..."
        docker compose logs -f "$service"
    else
        log_info "Showing logs for all services..."
        docker compose logs -f
    fi
}

# Clean up
clean() {
    log_warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up Docker resources..."
        docker compose down -v --rmi all --remove-orphans
        log_success "Cleanup completed!"
    else
        log_info "Cleanup cancelled."
    fi
}

# Show status
status() {
    log_info "Docker Compose Status:"
    docker compose ps
    echo
    log_info "Docker Images:"
    docker images | grep -E "(event-slider|code-camp)"
}

# Enter container shell
shell() {
    service=${2:-"ui"}
    log_info "Opening shell in $service container..."
    docker compose exec "$service" /bin/sh
}

# WebSocket server console
ws-console() {
    log_info "Connecting to WebSocket server interactive console..."
    log_info "The WebSocket server is running with an interactive CLI interface."
    log_info "Available commands: help, status, clients, quit, alert, etc."
    log_info "Press Ctrl+C to exit the console (server will keep running)"
    echo
    
    # Get the container ID
    CONTAINER_ID=$(docker compose ps -q websocket-server)
    
    if [ -z "$CONTAINER_ID" ]; then
        log_error "WebSocket server container not found. Is it running?"
        log_info "Run './docker-manager.sh dev' to start the services first."
        return 1
    fi
    
    log_warning "Attaching to WebSocket server console..."
    echo "💡 TIP: Press Ctrl+P then Ctrl+Q to detach without stopping the server"
    echo "💡 TIP: Or press Ctrl+C to exit this console session"
    echo ""
    
    # Try to attach to the running container
    docker attach "$CONTAINER_ID" || {
        log_warning "Direct attach failed, trying alternative method..."
        # Alternative: exec into the container and interact with the process
        docker exec -it "$CONTAINER_ID" /bin/sh -c '
            echo "� WebSocket Server Interactive Console"
            echo "Type \"help\" for available commands"
            echo "Type \"exit\" to quit this console"
            echo ""
            
            # Simple command loop
            while true; do
                printf "ws> "
                read -r cmd
                case "$cmd" in
                    "exit"|"quit")
                        echo "Goodbye! WebSocket server continues running..."
                        break
                        ;;
                    "")
                        continue
                        ;;
                    *)
                        # Try to send command to process stdin (this is a simplified approach)
                        echo "Command: $cmd (Note: Direct command execution requires the server to handle stdin)"
                        ;;
                esac
            done
        '
    }
}

# WebSocket server shell (for debugging)
ws-shell() {
    log_info "Opening shell in WebSocket server container..."
    docker compose exec -it websocket-server /bin/sh
}

# Show help
help() {
    cat << EOF
Event Slider Docker Management Script

Usage: $0 <command> [options]

Commands:
  dev         Start development environment (UI + WebSocket server)
  prod        Start production environment (built files + Nginx)
  build       Build all Docker images
  stop        Stop all running services
  clean       Remove all containers, images, and volumes
  logs [svc]  Show logs for all services or specific service
  status      Show status of containers and images
  shell [svc] Open shell in container (default: ui)
  ws-console  Connect to WebSocket server interactive CLI
  ws-shell    Open shell in WebSocket server container (for debugging)
  help        Show this help message

Examples:
  $0 dev                    # Start development environment
  $0 prod                   # Start production environment
  $0 logs ui                # Show logs for UI service
  $0 shell websocket-server # Open shell in WebSocket container
  $0 ws-console             # Connect to WebSocket CLI for commands
  $0 clean                  # Clean up all Docker resources

Services:
  ui              - Vite development server (port 3000)
  ui-prod         - Nginx production server (port 80)
  websocket-server - WebSocket backend server (port 8081)

EOF
}

# Main command handling
case "${1:-help}" in
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    build)
        build
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    shell)
        shell "$@"
        ;;
    ws-console)
        ws-console
        ;;
    ws-shell)
        ws-shell
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Unknown command: $1"
        echo
        help
        exit 1
        ;;
esac
