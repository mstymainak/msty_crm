# MSTY-CRM Quick Reference

## 🚀 Quick Start Commands

### Docker Deployment (Recommended)
```bash
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File docker-start.ps1

# Linux/Mac (Bash)
chmod +x docker-start.sh
./docker-start.sh
```

### Manual Docker Control
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

## 📱 Access URLs

| Service | URL | Credentials |
|---|---|---|
| CRM Dashboard | http://localhost:3000 | Configure in dashboard |
| MongoDB Local | mongodb://localhost:27017 | user: mstymainak_db_user / pass: Mahesh123 |
| MongoDB Compass | Connect to localhost:27017 | Same as above |

## 🔑 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Meta (Facebook)
META_VERIFY_TOKEN=your_token
META_PAGE_ACCESS_TOKEN=your_token
META_APP_SECRET=your_secret

# WordPress
WORDPRESS_URL=https://yoursite.com
WORDPRESS_API_USER=admin
WORDPRESS_API_PASSWORD=password

# Security
MIGRATION_KEY=secure-random-key
NEXTAUTH_SECRET=secure-random-key
```

## 📊 API Endpoints

### Customers
```
GET    /api/customers            List all
POST   /api/customers            Create
GET    /api/customers/:id        Single
PUT    /api/customers/:id        Update
DELETE /api/customers/:id        Delete
```

### Enquiries
```
GET    /api/enquiries            List all
POST   /api/enquiries            Create
GET    /api/enquiries/:id        Single
PUT    /api/enquiries/:id        Update
DELETE /api/enquiries/:id        Delete
```

### Bookings
```
GET    /api/bookings             List all
POST   /api/bookings             Create
GET    /api/bookings/:id         Single
PUT    /api/bookings/:id         Update
```

### Migration
```
GET    /api/migrate/wordpress-contacts?key=KEY    Status
POST   /api/migrate/wordpress-contacts             Run
```

## 🔧 Common Commands

### WordPress Data Migration
```bash
# Via CLI
node migrate-wordpress-contacts.js

# Via API
curl -X POST http://localhost:3000/api/migrate/wordpress-contacts \
  -H "Authorization: Bearer YOUR_MIGRATION_KEY"

# Via Docker
docker exec msty-crm-app node migrate-wordpress-contacts.js
```

### MongoDB Management
```bash
# Connect to MongoDB
docker exec -it msty-crm-mongodb mongosh --username mstymainak_db_user --password Mahesh123

# Backup database
docker exec msty-crm-mongodb mongodump --username mstymainak_db_user --password Mahesh123

# Restore database
docker exec msty-crm-mongodb mongorestore --username mstymainak_db_user --password Mahesh123
```

### View Logs
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs app --tail=100

# Real-time monitoring
docker-compose logs -f
```

### Execute Commands in Container
```bash
# Run shell
docker exec -it msty-crm-app /bin/bash

# Run Node command
docker exec msty-crm-app npm run build

# Run script
docker exec msty-crm-app node migrate-wordpress-contacts.js
```

## 🐛 Troubleshooting Quick Fixes

### Port Already in Use
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or just use different port
docker-compose down
# Edit docker-compose.yml, change port
docker-compose up -d
```

### MongoDB Connection Error
```bash
# Check if MongoDB container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Build Fails with Node.js Error
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Docker Daemon Not Running
```bash
# Windows
# Open Docker Desktop application

# Linux
sudo systemctl start docker
sudo systemctl enable docker
```

## 📚 Documentation Files

| File | Purpose |
|---|---|
| PROJECT_README.md | Complete project overview |
| DOCKER_DEPLOYMENT_GUIDE.md | Docker setup & troubleshooting |
| WORDPRESS_MIGRATION_GUIDE.md | How to migrate contacts |
| DEPLOYMENT_CHECKLIST.md | Pre-deployment verification |
| AGENTS.md | Agent configuration |

## 🔐 Security Quick Checks

```bash
# Check if sensitive files are protected
ls -la .env.local      # Should exist
ls -la .env.docker     # Should not have real values in git

# Verify .gitignore includes .env files
cat .gitignore | grep env

# Check Docker image size
docker images | grep msty-crm

# List volumes
docker volume ls
```

## 📦 Useful Docker Commands

```bash
# Clean up unused resources
docker system prune -a

# Remove specific container
docker rm msty-crm-app

# Remove specific volume
docker volume rm msty-crm_mongodb_data

# View container stats
docker stats msty-crm-app

# Copy file from container
docker cp msty-crm-app:/app/file.txt ./file.txt

# Copy file to container
docker cp ./file.txt msty-crm-app:/app/file.txt
```

## 🆘 Emergency Procedures

### Complete Reset
```bash
# WARNING: This deletes all data!
docker-compose down -v
docker volume prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Restore from Backup
```bash
# Restore MongoDB backup
docker cp ./backup msty-crm-mongodb:/data/
docker exec msty-crm-mongodb mongorestore /data/backup \
  --username mstymainak_db_user --password Mahesh123
```

### View Real-Time Logs While Testing
```bash
# Terminal 1: Watch logs
docker-compose logs -f app

# Terminal 2: Run test command
curl -X POST http://localhost:3000/api/customers ...
```

## 🚀 Deployment Flow

```
1. Prepare Environment
   ├─ Update .env.local with credentials
   ├─ Test MongoDB connection
   └─ Verify API credentials

2. Build & Start
   ├─ Run docker-compose up -d
   ├─ Wait for services to be healthy
   └─ Verify http://localhost:3000 loads

3. Migrate Data
   ├─ Run WordPress migration
   ├─ Verify imported count
   └─ Check for duplicates

4. Test Integrations
   ├─ Send test Facebook message
   ├─ Submit test contact form
   └─ Verify data appears in dashboard

5. Go Live
   ├─ Set MIGRATION_KEY (secure)
   ├─ Configure Facebook webhooks
   ├─ Configure WordPress webhooks
   └─ Monitor logs for errors

6. Ongoing
   ├─ Regular database backups
   ├─ Monitor container health
   ├─ Review logs weekly
   └─ Update credentials as needed
```

## 📞 Key Contacts

| Role | Contact | Method |
|---|---|---|
| Developer | [Fill in] | [Fill in] |
| Database Admin | [Fill in] | [Fill in] |
| Product Owner | [Fill in] | [Fill in] |
| DevOps | [Fill in] | [Fill in] |

## 📝 Notes

```
Add your own notes and custom procedures here:

Example:
- Custom deployment server: IP/domain
- Backup location: path/to/backups
- Monitoring dashboard: URL
- Alert email: address
```

---

**Version:** 0.1.0  
**Last Updated:** May 2026  
**Print This:** Yes - Keep this handy!
