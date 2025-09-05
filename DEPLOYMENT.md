# Rural Loan AI - Deployment Guide

## Quick Start

### Prerequisites

1. **Docker & Docker Compose**: Install Docker Desktop or Docker Engine
2. **Node.js**: Version 18+ for local development
3. **Environment Variables**: Copy and configure environment file

### 1. Clone and Setup

```bash
git clone <repository-url>
cd rural-loan-ai
cp env.example .env
# Edit .env with your configuration
```

### 2. Deploy with Docker

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy the complete system
./scripts/deploy.sh deploy
```

### 3. Access Services

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **AI Services**: http://localhost:5000
- **Grafana Dashboard**: http://localhost:3001 (admin/admin123)
- **Kibana Logs**: http://localhost:5601
- **Prometheus**: http://localhost:9090

## Detailed Deployment

### Environment Configuration

1. **Copy Environment File**:
   ```bash
   cp env.example .env
   ```

2. **Configure Required Variables**:
   ```bash
   # Database
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/rural_loan_ai
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT Secret (Change in production!)
   JWT_SECRET=your-super-secret-jwt-key
   
   # OpenAI API Key
   OPENAI_API_KEY=your-openai-api-key
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=ap-south-1
   S3_BUCKET=rural-loan-documents
   ```

### Manual Deployment Steps

#### 1. Start Infrastructure Services

```bash
# Start database and cache
docker-compose up -d postgres redis

# Wait for services to be ready
sleep 30
```

#### 2. Build and Start Application Services

```bash
# Build images
docker-compose build backend ai-services worker

# Start application services
docker-compose up -d backend ai-services worker
```

#### 3. Run Database Migrations

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

#### 4. Start Monitoring Services

```bash
# Start monitoring stack
docker-compose up -d prometheus grafana elasticsearch logstash kibana
```

#### 5. Start Additional Services

```bash
# Start remaining services
docker-compose up -d nginx rabbitmq minio
```

### Mobile App Deployment

#### Android

```bash
cd mobile

# Install dependencies
npm install

# Build for Android
npm run build:android

# Generate APK
cd android && ./gradlew assembleRelease
```

#### iOS

```bash
cd mobile

# Install dependencies
npm install

# Build for iOS
npm run build:ios

# Open in Xcode
open ios/RuralLoan.xcworkspace
```

### Production Deployment

#### 1. Production Environment Setup

```bash
# Set production environment
export NODE_ENV=production

# Use production Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. SSL Configuration

```bash
# Generate SSL certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/cert.pem

# Update nginx configuration
cp nginx/nginx.prod.conf nginx/nginx.conf
```

#### 3. Load Balancer Setup

```bash
# Configure load balancer
# Update nginx configuration for multiple backend instances
# Set up health checks and failover
```

### Monitoring and Maintenance

#### Health Checks

```bash
# Check service health
./scripts/deploy.sh health

# View service status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs [service-name]
```

#### Backup and Recovery

```bash
# Create backup
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh backup-20240101-120000.tar.gz
```

#### Updates

```bash
# Update deployment
./scripts/deploy.sh update

# Rollback if needed
./scripts/deploy.sh rollback
```

### Scaling

#### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale AI services
docker-compose up -d --scale ai-services=2

# Update load balancer configuration
```

#### Database Scaling

```bash
# Set up read replicas
# Configure connection pooling
# Implement database sharding
```

### Security Configuration

#### 1. Network Security

```bash
# Configure firewall rules
# Set up VPN access
# Implement network segmentation
```

#### 2. Application Security

```bash
# Enable HTTPS
# Configure CORS properly
# Set up rate limiting
# Implement API authentication
```

#### 3. Data Security

```bash
# Encrypt sensitive data
# Set up data backup encryption
# Configure access controls
# Implement audit logging
```

### Troubleshooting

#### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready
   
   # Check connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection Issues**:
   ```bash
   # Check Redis status
   docker-compose exec redis redis-cli ping
   ```

3. **AI Services Not Responding**:
   ```bash
   # Check AI services logs
   docker-compose logs ai-services
   
   # Verify OpenAI API key
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
   ```

4. **Mobile App Build Issues**:
   ```bash
   # Clear React Native cache
   cd mobile && npx react-native start --reset-cache
   
   # Clean and rebuild
   cd android && ./gradlew clean
   ```

#### Log Analysis

```bash
# View application logs
docker-compose logs -f backend

# View AI services logs
docker-compose logs -f ai-services

# Search logs in Kibana
# Access http://localhost:5601
```

#### Performance Monitoring

```bash
# Check system resources
docker stats

# View Prometheus metrics
# Access http://localhost:9090

# View Grafana dashboards
# Access http://localhost:3001
```

### Maintenance Tasks

#### Daily Tasks

- Monitor system health
- Check error logs
- Verify backup completion
- Review performance metrics

#### Weekly Tasks

- Update dependencies
- Review security logs
- Analyze usage patterns
- Optimize database queries

#### Monthly Tasks

- Security audit
- Performance review
- Capacity planning
- Disaster recovery testing

### Support and Documentation

- **API Documentation**: http://localhost:3000/api-docs
- **System Monitoring**: http://localhost:3001
- **Log Analysis**: http://localhost:5601
- **Metrics**: http://localhost:9090

For additional support, please refer to the main README.md file or contact the development team.
