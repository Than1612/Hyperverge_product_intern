#!/bin/bash

# Rural Loan AI Deployment Script
# This script handles the complete deployment of the Rural Loan AI system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="rural-loan-ai"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

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

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env file not found. Creating from template..."
        cp env.example "$ENV_FILE"
        log_warning "Please update the .env file with your configuration before proceeding."
        exit 1
    fi
    
    log_success "All requirements met!"
}

create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "./monitoring/grafana/dashboards"
    mkdir -p "./monitoring/grafana/datasources"
    mkdir -p "./monitoring/logstash/pipeline"
    mkdir -p "./monitoring/logstash/config"
    mkdir -p "./nginx/ssl"
    
    log_success "Directories created!"
}

backup_existing_data() {
    log_info "Creating backup of existing data..."
    
    if [ -d "$BACKUP_DIR" ]; then
        BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$BACKUP_FILE" ./data 2>/dev/null || true
        log_success "Backup created: $BACKUP_FILE"
    fi
}

build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build backend
    
    # Build AI services image
    log_info "Building AI services image..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build ai-services
    
    # Build worker image
    log_info "Building worker image..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build worker
    
    log_success "All images built successfully!"
}

start_services() {
    log_info "Starting services..."
    
    # Start infrastructure services first
    log_info "Starting infrastructure services (PostgreSQL, Redis)..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres redis
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 30
    
    # Start application services
    log_info "Starting application services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d backend ai-services worker
    
    # Start monitoring services
    log_info "Starting monitoring services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d prometheus grafana elasticsearch logstash kibana
    
    # Start additional services
    log_info "Starting additional services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d nginx rabbitmq minio
    
    log_success "All services started!"
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for backend to be ready
    sleep 10
    
    # Run migrations
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec backend npm run migrate
    
    log_success "Database migrations completed!"
}

seed_database() {
    log_info "Seeding database with initial data..."
    
    # Run seeders
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec backend npm run seed
    
    log_success "Database seeded successfully!"
}

health_check() {
    log_info "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Backend service is healthy"
    else
        log_error "Backend service is not responding"
        return 1
    fi
    
    # Check AI services health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "AI services are healthy"
    else
        log_error "AI services are not responding"
        return 1
    fi
    
    # Check database connection
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "Database is healthy"
    else
        log_error "Database is not responding"
        return 1
    fi
    
    # Check Redis connection
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis is healthy"
    else
        log_error "Redis is not responding"
        return 1
    fi
    
    log_success "All health checks passed!"
}

show_status() {
    log_info "Service Status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    echo ""
    log_info "Service URLs:"
    echo "  Backend API: http://localhost:3000"
    echo "  AI Services: http://localhost:5000"
    echo "  API Documentation: http://localhost:3000/api-docs"
    echo "  Grafana Dashboard: http://localhost:3001 (admin/admin123)"
    echo "  Kibana Logs: http://localhost:5601"
    echo "  Prometheus: http://localhost:9090"
    echo "  RabbitMQ Management: http://localhost:15672 (admin/admin123)"
    echo "  MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Cleanup completed!"
}

# Main deployment function
deploy() {
    log_info "Starting deployment of $PROJECT_NAME..."
    
    check_requirements
    create_directories
    backup_existing_data
    build_images
    start_services
    run_migrations
    seed_database
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 60
    
    if health_check; then
        log_success "Deployment completed successfully!"
        show_status
    else
        log_error "Deployment failed health checks!"
        exit 1
    fi
}

# Rollback function
rollback() {
    log_info "Rolling back deployment..."
    
    # Stop all services
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Restore from backup if available
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring from backup: $LATEST_BACKUP"
        tar -xzf "$LATEST_BACKUP"
    fi
    
    log_success "Rollback completed!"
}

# Update function
update() {
    log_info "Updating deployment..."
    
    # Pull latest images
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Rebuild and restart services
    build_images
    start_services
    
    # Run migrations if needed
    run_migrations
    
    log_success "Update completed!"
}

# Stop function
stop() {
    log_info "Stopping all services..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    log_success "All services stopped!"
}

# Logs function
logs() {
    SERVICE=${1:-""}
    
    if [ -n "$SERVICE" ]; then
        log_info "Showing logs for $SERVICE..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f "$SERVICE"
    else
        log_info "Showing logs for all services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
    fi
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    update)
        update
        ;;
    stop)
        stop
        ;;
    logs)
        logs "$2"
        ;;
    status)
        show_status
        ;;
    health)
        health_check
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|update|stop|logs|status|health|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the complete system (default)"
        echo "  rollback - Rollback to previous version"
        echo "  update   - Update existing deployment"
        echo "  stop     - Stop all services"
        echo "  logs     - Show logs (optionally for specific service)"
        echo "  status   - Show service status and URLs"
        echo "  health   - Run health checks"
        echo "  cleanup  - Clean up unused Docker resources"
        exit 1
        ;;
esac
