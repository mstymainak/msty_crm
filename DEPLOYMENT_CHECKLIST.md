# MSTY-CRM Deployment Checklist

Complete this checklist to ensure your CRM is ready for production.

## ✅ Pre-Deployment Setup

### System Requirements
- [ ] Docker Desktop installed and running
- [ ] Docker Compose available (`docker-compose --version`)
- [ ] At least 4GB free disk space
- [ ] Ports 3000 and 27017 available (check: `netstat -an | findstr :3000`)
- [ ] Modern web browser (Chrome, Firefox, Safari, Edge)

### Configuration Files
- [ ] `.env.local` created with all required variables
- [ ] `MONGODB_URI` is valid and accessible
- [ ] `MIGRATION_KEY` is set to a secure value
- [ ] `NEXTAUTH_SECRET` is configured
- [ ] All API keys filled in (or marked as "demo")

### Required Credentials
- [ ] Meta Business Token (Facebook integration) - optional for demo
- [ ] WordPress credentials verified
- [ ] MongoDB connection tested locally

## 🚀 Deployment Steps

### Step 1: Environment Setup
```bash
cd msty-crm

# Verify .env.local has all variables
cat .env.local

# Generate new migration key if needed
# powershell: [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32) | ...
```
- [ ] All environment variables present
- [ ] No placeholder values left (unless demo)

### Step 2: Docker Build
```bash
# Windows
powershell -ExecutionPolicy Bypass -File docker-start.ps1

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```
- [ ] Docker image builds without errors
- [ ] No build warnings about dependencies
- [ ] Build completes in < 5 minutes

### Step 3: Services Start
```bash
docker-compose ps
```
- [ ] `msty-crm-app` is running (status: "Up")
- [ ] `msty-crm-mongodb` is running (status: "Up")
- [ ] Both containers are healthy
- [ ] Both ports are exposed (3000, 27017)

### Step 4: Application Verification
```bash
# Check if app is responding
curl http://localhost:3000

# Check migration API
curl http://localhost:3000/api/migrate/wordpress-contacts?key=YOUR_KEY
```
- [ ] CRM dashboard loads at http://localhost:3000
- [ ] No 502 Bad Gateway errors
- [ ] Migration API returns "ready" status
- [ ] All UI elements visible

### Step 5: Database Connectivity
```bash
# Test MongoDB connection
docker exec msty-crm-mongodb mongosh --username mstymainak_db_user --password Mahesh123
```
- [ ] MongoDB shell connects successfully
- [ ] Database `msty_crm` exists
- [ ] Collections are empty (first run) or have data (migrated)

### Step 6: API Testing
```bash
# Test customers endpoint
curl http://localhost:3000/api/customers

# Test enquiries endpoint
curl http://localhost:3000/api/enquiries
```
- [ ] All endpoints return valid JSON
- [ ] No 500 errors in responses
- [ ] Empty arrays indicate fresh setup (correct)

## 📊 Data Setup

### WordPress Migration
```bash
# Option A: Run migration
docker exec msty-crm-app node migrate-wordpress-contacts.js

# Option B: Use API
curl -X POST http://localhost:3000/api/migrate/wordpress-contacts \
  -H "Authorization: Bearer YOUR_MIGRATION_KEY"
```
- [ ] Migration completes without errors
- [ ] Check results: `imported`, `skipped`, `errors`
- [ ] Verify contacts appear in dashboard

### Manual Testing
- [ ] Create a test customer record
- [ ] Create a test enquiry
- [ ] Create a test booking
- [ ] Delete test records

## 🔒 Security Checklist

### Environment Security
- [ ] Sensitive keys are not in git repo
- [ ] `.env.local` is in `.gitignore`
- [ ] `MONGODB_URI` uses strong password
- [ ] `MIGRATION_KEY` is cryptographically random
- [ ] `NEXTAUTH_SECRET` is set and secure

### Access Control
- [ ] Default admin credentials changed
- [ ] API endpoints require authentication where needed
- [ ] CORS is properly configured
- [ ] Rate limiting is considered

### Data Protection
- [ ] Database backups are automated
- [ ] Sensitive fields are not logged
- [ ] API responses don't expose internal details
- [ ] HTTPS is enforced in production

## 📦 Backup & Disaster Recovery

### Database Backups
```bash
# Create backup
docker exec msty-crm-mongodb mongodump \
  --username mstymainak_db_user \
  --password Mahesh123
```
- [ ] Backup strategy defined
- [ ] Test backup restoration
- [ ] Backup location documented

### Code Backups
- [ ] Git repository is backed up
- [ ] `.env.python` credentials are backed up separately
- [ ] Change log is maintained

## 🌐 External Integrations

### Facebook Messenger
- [ ] Meta app created
- [ ] Webhook URL configured in Meta
- [ ] Verify token matches
- [ ] Test message received and logged

### WordPress Integration
- [ ] WordPress API enabled
- [ ] API credentials verified
- [ ] Webhook endpoint configured (optional)
- [ ] Test migration completes

## 📈 Performance Monitoring

### Application Performance
- [ ] Check dashboard load time (< 3 seconds)
- [ ] Monitor API response times (< 500ms)
- [ ] Check Docker memory usage
- [ ] Monitor MongoDB performance

### Logging
- [ ] Application logs visible: `docker-compose logs app`
- [ ] Database logs accessible: `docker-compose logs mongodb`
- [ ] Error logs are actionable
- [ ] Rotation policy set

## 🚨 Issue Resolution

### If Build Fails
- [ ] Check Docker logs: `docker-compose logs`
- [ ] Verify Node version (20+)
- [ ] Check disk space
- [ ] Try rebuild: `docker-compose build --no-cache`

### If Services Won't Start
- [ ] Check port conflicts: `netstat -an | findstr :3000`
- [ ] Check Docker daemon: `docker ps`
- [ ] Check memory: Docker needs 2GB+
- [ ] Check permissions on volumes

### If Database Connection Fails
- [ ] Verify MongoDB container is healthy: `docker-compose ps`
- [ ] Check credentials in .env.local
- [ ] Test connection: `docker exec msty-crm-mongodb mongosh`
- [ ] Check network: `docker network ls`

## ✨ Final Verification

### User Acceptance Testing
- [ ] Login functionality works
- [ ] Create customer → works
- [ ] Create enquiry → works
- [ ] View dashboard → works
- [ ] Search contacts → works
- [ ] Export data → works (if implemented)
- [ ] Responsive design on mobile → works

### Stakeholder Sign-off
- [ ] Product owner reviews app
- [ ] All requested features are present
- [ ] No critical bugs identified
- [ ] Performance is acceptable
- [ ] User interface is intuitive

## 📋 Documentation Complete

- [ ] README.md is clear and accurate
- [ ] DOCKER_DEPLOYMENT_GUIDE.md is complete
- [ ] WORDPRESS_MIGRATION_GUIDE.md is complete
- [ ] API documentation available
- [ ] Troubleshooting guide provided
- [ ] Admin manual created (optional)

## 🎯 Production Deployment

### Pre-Production
- [ ] All tests pass locally
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance benchmarks met

### Deployment Steps
```bash
# Stop local development
docker-compose down

# Deploy to production
# (Contact DevOps/Infrastructure team)
```
- [ ] Deployment to production environment completed
- [ ] SSL/HTTPS certificates installed
- [ ] Domain DNS configured
- [ ] Email notifications working

### Post-Deployment
- [ ] Monitor application logs
- [ ] Verify all integrations working
- [ ] Test critical user workflows
- [ ] Collect user feedback
- [ ] Plan for future enhancements

## 📞 Support Contacts

| Role | Contact | Availability |
|---|---|---|
| Product Owner | - | - |
| DevOps/Infrastructure | - | - |
| Database Admin | - | - |
| Security Team | - | - |

## 📅 Deployment Timeline

| Phase | Planned Date | Actual Date | Status |
|---|---|---|---|
| Environment Setup | - | - | ⬜ |
| Docker Build & Test | - | - | ⬜ |
| Data Migration | - | - | ⬜ |
| Integration Testing | - | - | ⬜ |
| UAT | - | - | ⬜ |
| Production Deploy | - | - | ⬜ |
| Go-Live | - | - | ⬜ |

## ✅ Sign-Off

**Project:** MSTY-CRM  
**Version:** 0.1.0  
**Deployment Date:** _______________  
**Deployed By:** _______________  
**Approved By:** _______________  

---

**Notes:**
```
[Add any special notes, known issues, or post-deployment tasks here]
```

---

**Last Updated:** May 2026  
**Reviewed By:** _______________  
**Next Review Date:** _______________
