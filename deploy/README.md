# 🐳 Docker Deployment - Quick Start Guide

## Prerequisites
- Docker installed on your VPS
- SSH access: `devuser@103.149.105.113`
- Git installed on VPS

## 📦 One-Time Setup

### 1. Prepare Local Environment

```bash
# Navigate to your project
cd /home/jamil/Documents/Jamil/betopia/hrautomain

# Ensure all scripts are executable (already done)
chmod +x deploy/*.sh setup.sh start.sh

# Make sure your .env file has proper values
# Copy from .env.example if needed
cp .env.example .env
# Then edit with your actual credentials
nano .env
```

### 2. Initial Deployment

```bash
cd deploy
./deploy.sh
```

This script will:
- Test SSH connection to VPS
- Clone/pull the repository
- Prompt you to manually upload sensitive files
- Build Docker images
- Start containers
- Run database migrations
- Display access URLs

### 3. Upload Sensitive Files to VPS

**IMPORTANT**: After first deployment, you must manually copy sensitive files to VPS:

```bash
# From your local machine, run these commands:

# Copy .env file
scp ../.env devuser@103.149.105.113:/home/devuser/hrautomation/

# Copy Google OAuth credentials
scp ../credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/
scp ../token.json devuser@103.149.105.113:/home/devuser/hrautomation/

# If you have emailanalysis credentials:
scp ../emailanalysis/credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/emailanalysis/
scp ../emailanalysis/token.json devuser@103.149.105.113:/home/devuser/hrautomation/emailanalysis/
```

### 4. Restart Containers After Adding Files

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart"
```

### 5. Create Django Admin User

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py createsuperuser"
```

## 🔄 Daily Workflow

### Making Changes and Deploying

```bash
# From your local machine:
cd /home/jamil/Documents/Jamil/betopia/hrautomain/deploy

# This single command does everything:
./update.sh
```

The `update.sh` script will:
1. Commit your local changes
2. Push to GitHub
3. Pull changes on VPS
4. Rebuild and restart Docker containers
5. Show you the result

**That's it!** Your changes are now live.

## 🌐 Access Your Application

- **Frontend**: http://103.149.105.113:5511
- **Backend API**: http://103.149.105.113:5512/api/
- **Admin Panel**: http://103.149.105.113:5512/admin/

## 🛠️ Common Commands

### View Logs

```bash
# SSH into VPS
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation/deploy

# View all logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart"

# Or restart specific service
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart backend"
```

### Stop Services

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose down"
```

### Start Services

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose up -d"
```

### Rebuild and Restart (after major changes)

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose down && docker-compose up -d --build"
```

### Check Container Status

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose ps"
```

### Execute Commands in Backend Container

```bash
# Django shell
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py shell"

# Run migrations
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py migrate"

# Create superuser
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py createsuperuser"

# Collect static files
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py collectstatic --noinput"
```

## 🔧 Configuration Files

### Port Configuration
- Frontend: `5511`
- Backend: `5512`

To change ports, edit:
- `deploy/docker-compose.yml` - Update port mappings
- `frontend/js/app.js` - Update API_BASE_URL detection

### Environment Variables (.env)

Required variables in `.env` file on VPS:

```env
# OpenAI
OPENAI_API_KEY=your_key_here

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Django
DJANGO_SECRET_KEY=generate-a-secure-random-key
DEBUG=False
ALLOWED_HOSTS=103.149.105.113,localhost
```

## 📊 Monitoring

### Check Resource Usage

```bash
ssh devuser@103.149.105.113

# Docker stats (real-time)
docker stats

# System resources
htop

# Disk usage
df -h
du -sh /home/devuser/hrautomation/*
```

### Clean Up Docker (if disk space is low)

```bash
ssh devuser@103.149.105.113

# Remove unused images and containers
docker system prune -a

# Remove unused volumes
docker volume prune
```

## 🚨 Troubleshooting

### Services won't start

```bash
# Check logs for errors
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation/deploy
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Can't access frontend/backend

1. Check if containers are running:
   ```bash
   docker-compose ps
   ```

2. Check if ports are accessible:
   ```bash
   curl http://103.149.105.113:5511
   curl http://103.149.105.113:5512/api/
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   # If ports are blocked:
   sudo ufw allow 5511
   sudo ufw allow 5512
   ```

### Database migrations fail

```bash
# Delete database and start fresh
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation
rm backend/db.sqlite3
cd deploy
docker-compose restart backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Out of disk space

```bash
ssh devuser@103.149.105.113

# Check disk usage
df -h

# Clean Docker
docker system prune -a
docker volume prune

# Remove old logs
rm -f /home/devuser/hrautomation/*.log
```

### Changes not reflecting

```bash
# Force rebuild
cd /home/jamil/Documents/Jamil/betopia/hrautomain/deploy
./update.sh

# Or manually:
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation
git pull origin master
cd deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔐 Security Notes

1. **Never commit sensitive files** to Git:
   - `.env`
   - `credentials.json`
   - `token.json`
   - `db.sqlite3`

2. **Always copy sensitive files manually** via SCP

3. **Change default Django SECRET_KEY** in production

4. **Set DEBUG=False** in production `.env`

5. **Restrict ALLOWED_HOSTS** to your VPS IP only

## 📁 File Structure on VPS

```
/home/devuser/hrautomation/
├── .env                    # Environment variables (SENSITIVE)
├── credentials.json        # Google OAuth (SENSITIVE)
├── token.json             # Google token (SENSITIVE)
├── backend/               # Django backend (volume mounted)
├── frontend/              # Web frontend (volume mounted)
├── src/                   # Core code (volume mounted)
├── data/                  # Data & templates (volume mounted)
├── outputs/               # Generated files (volume mounted)
└── deploy/
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    ├── docker-compose.yml
    ├── deploy.sh
    └── update.sh
```

## 🎯 Best Practices

1. **Always use `update.sh`** for quick updates
2. **Test locally first** before deploying
3. **Check logs** after deployment
4. **Monitor disk space** regularly (10GB limit)
5. **Backup database** before major changes:
   ```bash
   ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec -T backend python manage.py dumpdata > backup_$(date +%Y%m%d).json"
   ```

## 📞 Support

For more detailed information, see:
- `deploy/DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `README.md` - General project documentation

## 🎉 Summary

**Deploy first time:**
```bash
cd deploy && ./deploy.sh
```

**Update after changes:**
```bash
cd deploy && ./update.sh
```

**View logs:**
```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose logs -f"
```

That's all you need to know! 🚀
