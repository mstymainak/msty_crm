# MSTY-CRM Docker Deployment Guide

This guide explains how to deploy the MSTY-CRM system using Docker containers.

## Overview

The Docker setup includes:
- **Next.js Application** running in a Node.js container
- **MongoDB Database** running in a MongoDB container
- **Docker Network** for inter-container communication
- **Volume Management** for persistent database storage

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- .env.docker configured with your credentials

## Quick Start

### 1. Build and Start All Services

```bash
# From project root directory
docker-compose up -d
```

This will:
- Build the MSTY-CRM Docker image
- Pull the MongoDB image
- Create a Docker network
- Start both containers
- Create persistent volumes for MongoDB data

### 2. Verify Services are Running

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                COMMAND                  STATUS
# msty-crm-app        "npm start"              Up (healthy)
# msty-crm-mongodb    "mongod"                 Up (healthy)
```

### 3. Access the Application

- **CRM Dashboard:** http://localhost:3000
- **MongoDB Connection:** `mongodb://localhost:27017`
- **MongoDB User:** `mstymainak_db_user`
- **MongoDB Password:** `Mahesh123`

### 4. Run WordPress Migration

Migration in Docker:

```bash
# Option A: Via HTTP API
curl -X POST http://localhost:3000/api/migrate/wordpress-contacts \
  -H "Authorization: Bearer CC46637FCE9F735F83001EBD5BD27D7E64AC7CA9EC592FEF6E832918BAA37373"

# Option B: Execute in container
docker exec msty-crm-app node migrate-wordpress-contacts.js
```

## Docker Compose Configuration

### Services Included

#### MongoDB Service
```yaml
mongodb:
  image: mongo:7-alpine
  ports: 27017
  volumes: 
    - mongodb_data:/data/db (persistent storage)
  healthcheck: enabled
```

#### App Service
```yaml
app:
  build: ./Dockerfile
  ports: 3000
  depends_on: mongodb
  environment: All .env variables
```

## Environment Variables

All \`.env.local\` variables are automatically loaded into the Docker container:

| Variable | Purpose | Default |
|---|---|---|
| `MONGODB_URI` | Database connection | Auto-configured |
| `META_PAGE_ACCESS_TOKEN` | Facebook integration | Config needed |
| `WORDPRESS_API_PASSWORD` | WordPress auth | Config needed |
| `MIGRATION_KEY` | Migration security | Generated secure key |
| `NODE_ENV` | Runtime environment | production |

### Custom Environment File

Create `.env.docker` to override defaults:

```bash
cp .env.docker .env.docker.local
# Edit with your values
docker-compose --env-file .env.docker.local up -d
```

## Common Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs app --tail=100
```

### Stop Services

```bash
# Stop containers (keep volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

### Rebuild Image

```bash
# Rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build
```

### Execute Commands

```bash
# Run command in app container
docker exec msty-crm-app npm run build
docker exec msty-crm-app node migrate-wordpress-contacts.js

# Access app shell
docker exec -it msty-crm-app /bin/bash

# MongoDB shell
docker exec -it msty-crm-mongodb mongosh
```

## Database Management

### MongoDB in Docker

#### Connect via mongosh (inside container)

```bash
docker exec -it msty-crm-mongodb mongosh \
  --username mstymainak_db_user \
  --password Mahesh123 \
  --authenticationDatabase admin
```

#### MongoDB Atlas GUI Tools

Use MongoDB Compass to connect:
- **Host:** localhost
- **Port:** 27017
- **Username:** mstymainak_db_user
- **Password:** Mahesh123
- **AuthSource:** admin

### Backup Database

```bash
# Create backup
docker exec msty-crm-mongodb mongodump \
  --username mstymainak_db_user \
  --password Mahesh123 \
  --authenticationDatabase admin \
  --out /data/backup

# Copy to host
docker cp msty-crm-mongodb:/data/backup ./backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup msty-crm-mongodb:/data/

# Restore
docker exec msty-crm-mongodb mongorestore \
  --username mstymainak_db_user \
  --password Mahesh123 \
  --authenticationDatabase admin \
  /data/backup
```

## Networking

### Container Communication

Services communicate using container names:
- App container: `msty-crm-app`
- MongoDB container: `mongodb`
- Network: `msty-network`

Example in code:
```
mongodb://user:pass@mongodb:27017/database
```

### Port Mapping

| Service | Container Port | Host Port | Access |
|---|---|---|---|
| App | 3000 | 3000 | http://localhost:3000 |
| MongoDB | 27017 | 27017 | localhost:27017 |

### Expose Additional Ports

Edit `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "3000:3000"
      - "3001:3001"  # Additional port
```

## Production Deployment

### Security Hardening

1. **Change MongoDB Credentials**
   ```yaml
   environment:
     MONGO_INITDB_ROOT_USERNAME: secure_username
     MONGO_INITDB_ROOT_PASSWORD: ${DB_PASSWORD}
   ```

2. **Use Secrets Management**
   ```bash
   docker secret create migration_key -
   # Type your secure key
   ```

3. **Set NODE_ENV to Production**
   ```yaml
   NODE_ENV: production
   ```

4. **Restrict Network Access**
   ```bash
   # Only expose to specific networks
   - "127.0.0.1:3000:3000"  # Localhost only
   ```

### Scaling

Deploy behind a reverse proxy (Nginx):

```yaml
nginx:
  image: nginx:latest
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - app
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
  
  mongodb:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Port 3000 already in use: docker-compose down
# - MongoDB failed to start: Check memory (needs ~500MB)
# - Build error: docker-compose build --no-cache --progress=plain
```

### MongoDB Connection Error

```bash
# Verify MongoDB is healthy
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker exec msty-crm-app ping mongodb
```

### Volume Permission Issues

```bash
# Fix volumes ownership (Linux only)
sudo chown -R 999:999 ./mongodb_data

# Or recreate volumes
docker-compose down -v
docker-compose up -d
```

### Out of Memory

```bash
# Check Docker desktop memory allocation
# Settings > Resources > Memory (increase to 4GB+)

# Restart with more memory
docker-compose down
docker-compose up -d
```

## Cleanup

### Remove Everything

```bash
# Stop and remove all containers and networks
docker-compose down

# Also remove volumes (WARNING: deletes data!)
docker-compose down -v

# Remove unused images
docker image prune

# Full cleanup
docker system prune -a
```

### Unused Volumes

```bash
# List volumes
docker volume ls

# Remove unused
docker volume prune

# Remove specific volume
docker volume rm msty-crm_mongodb_data
```

## Advanced Topics

### Custom Dockerfile

Build with custom settings:
```bash
docker build -t msty-crm:custom \
  --build-arg NODE_ENV=production \
  -f Dockerfile .
```

### Docker Registry

Push to Docker Hub:
```bash
# Login
docker login

# Tag image
docker tag msty-crm:latest username/msty-crm:latest

# Push
docker push username/msty-crm:latest
```

### CI/CD Integration

Example GitHub Actions workflow:
```yaml
- name: Build Docker image
  run: docker-compose build

- name: Push to registry
  run: docker push myregistry.azurecr.io/msty-crm
```

## Support

For issues:
1. Check `docker-compose logs` for errors
2. Verify environment variables are set
3. Ensure ports 3000 and 27017 are available
4. Check Docker Desktop is running
5. Review `WORDPRESS_MIGRATION_GUIDE.md` for migration issues
