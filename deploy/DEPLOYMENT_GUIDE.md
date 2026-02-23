# HR Automation Deployment Guide

## 🚀 Quick Start Deployment

### Prerequisites
- Docker installed on VPS
- SSH access to VPS (devuser@103.149.105.113)
- Git repository access

### Initial Deployment

1. **Prepare sensitive files locally** (DO NOT commit these to Git):
   ```bash
   # Make sure you have:
   # - .env file with your API keys
   # - credentials.json (Google OAuth)
   # - token.json (Google OAuth)
   ```

2. **Run deployment script**:
   ```bash
   cd deploy
   chmod +x deploy.sh update.sh
   ./deploy.sh
   ```

3. **Manually copy sensitive files to VPS**:
   ```bash
   # Copy .env file
   scp ../.env devuser@103.149.105.113:/home/devuser/hrautomation/
   
   # Copy Google credentials
   scp ../credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/
   scp ../token.json devuser@103.149.105.113:/home/devuser/hrautomation/
   
   # If you have emailanalysis credentials
   scp ../emailanalysis/credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/emailanalysis/
   scp ../emailanalysis/token.json devuser@103.149.105.113:/home/devuser/hrautomation/emailanalysis/
   ```

4. **Restart containers after adding sensitive files**:
   ```bash
   ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart"
   ```

5. **Create Django superuser**:
   ```bash
   ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py createsuperuser"
   ```

### Access Your Application

- **Frontend**: http://103.149.105.113:5511
- **Backend API**: http://103.149.105.113:5512/api/
- **Admin Panel**: http://103.149.105.113:5512/admin/

---

## 🔄 Daily Development Workflow

### Making Changes Locally

1. **Make your code changes** in your local repository

2. **Update VPS** with one command:
   ```bash
   cd deploy
   ./update.sh
   ```

This script will:
- Commit and push your changes to GitHub
- Pull changes on VPS
- Rebuild and restart Docker containers
- Show you the status

---

## 🐳 Docker Management

### View Logs
```bash
# SSH into VPS
ssh devuser@103.149.105.113

# Navigate to project
cd /home/devuser/hrautomation/deploy

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services
```bash
docker-compose down
```

### Start Services
```bash
docker-compose up -d
```

### Rebuild Containers
```bash
# Rebuild and restart
docker-compose up -d --build
```

### Check Container Status
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
# Django shell
docker-compose exec backend python manage.py shell

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

---

## 🔧 Configuration

### Environment Variables (.env)
Located at `/home/devuser/hrautomation/.env` on VPS:

```env
# OpenAI API Key
OPENAI_API_KEY=your_key_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=103.149.105.113,localhost
```

### Ports
- Frontend: 5511
- Backend: 5512

### File Locations on VPS
```
/home/devuser/hrautomation/
├── .env                    # Environment variables (sensitive)
├── credentials.json        # Google OAuth (sensitive)
├── token.json             # Google OAuth token (sensitive)
├── backend/               # Django backend
├── frontend/              # Web frontend
├── src/                   # Core application code
├── data/                  # Data and templates
├── outputs/               # Generated reports
└── deploy/               # Docker configuration
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    ├── docker-compose.yml
    ├── deploy.sh
    └── update.sh
```

---

## 🛠️ Troubleshooting

### Check if services are running
```bash
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation/deploy
docker-compose ps
```

### Check logs for errors
```bash
docker-compose logs backend --tail=100
docker-compose logs frontend --tail=100
```

### Restart everything
```bash
docker-compose down
docker-compose up -d --build
```

### Database issues
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Check database
docker-compose exec backend python manage.py dbshell
```

### Permission issues
```bash
# Fix ownership
ssh devuser@103.149.105.113
sudo chown -R devuser:devuser /home/devuser/hrautomation
```

### Out of disk space (10GB VPS)
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Check disk usage
df -h
du -sh /home/devuser/hrautomation/*
```

### Backend not responding
```bash
# Check if backend is actually running
docker-compose exec backend ps aux

# Restart backend
docker-compose restart backend

# Check backend logs
docker-compose logs backend -f
```

---

## 📊 Monitoring

### Check Resource Usage
```bash
# On VPS
ssh devuser@103.149.105.113

# Check system resources
htop

# Check Docker container resources
docker stats

# Check disk usage
df -h
du -sh /home/devuser/hrautomation/*
```

### Application Health
```bash
# Test backend API
curl http://103.149.105.113:5512/api/

# Test frontend
curl http://103.149.105.113:5511/
```

---

## 🔒 Security Considerations

1. **Never commit sensitive files**:
   - `.env`
   - `credentials.json`
   - `token.json`
   - `db.sqlite3` (contains data)

2. **Update .env on VPS** when you change API keys locally

3. **Use SSH key authentication** instead of passwords

4. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```

---

## 🆘 Emergency Procedures

### Complete Reset
```bash
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation/deploy

# Stop and remove everything
docker-compose down -v

# Remove all data (BE CAREFUL!)
cd ..
rm -rf * .git

# Redeploy from scratch
# Then run initial deployment steps again
```

### Backup Database
```bash
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation

# Backup database
docker-compose exec -T backend python manage.py dumpdata > backup_$(date +%Y%m%d).json

# Download backup
scp devuser@103.149.105.113:/home/devuser/hrautomation/backup_*.json ./
```

### Restore Database
```bash
# Upload backup
scp backup_20260223.json devuser@103.149.105.113:/home/devuser/hrautomation/

# Restore
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation
docker-compose exec -T backend python manage.py loaddata backup_20260223.json
```

---

## 📞 Support

For issues, check:
1. Container logs: `docker-compose logs -f`
2. System resources: `docker stats`
3. Disk space: `df -h`
4. Application logs in `/home/devuser/hrautomation/*.log`
