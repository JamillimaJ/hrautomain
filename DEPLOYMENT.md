# HR Automation - Deployment Guide

Complete guide for deploying the HR Automation system to a VPS using Docker.

## 📋 Prerequisites

- A VPS with:
  - Ubuntu 20.04+ or similar Linux distribution  
  - At least 2GB RAM
  - SSH access
  - Ports 5511 and 5512 open
- Git installed on your local machine
- GitHub repository access

## 🚀 Quick Deployment (One-Time Setup)

### Step 1: Prepare Your Local Environment

1. **Ensure your .env file is configured:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Make sure credentials files exist:**
   - `.env` (required)
   - `credentials.json` (for Google Drive - optional)
   - `token.json` (for Google Drive - optional)

### Step 2: Run Initial Setup

Make the setup script executable and run it:

```bash
chmod +x deploy/initial-setup.sh
./deploy/initial-setup.sh
```

This script will:
- Install Docker and Docker Compose on your VPS
- Clone the repository to `/home/devuser/hrautomation`
- Copy your credentials securely
- Build and start Docker containers
- Run database migrations
- Configure firewall rules

**Expected output:**
```
✨ Initial setup complete!

🌐 Your application is now running at:
   Frontend: http://103.149.105.113:5511
   Backend API: http://103.149.105.113:5512/api/
   Admin Panel: http://103.149.105.113:5512/admin/
```

### Step 3: Create Django Superuser

After initial setup, create an admin account:

```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose exec backend python manage.py createsuperuser'
```

Follow the prompts to set up your admin account.

## 🔄 Continuous Deployment (Daily Workflow)

### Making Changes Locally

1. **Edit your code locally** as needed

2. **Deploy to VPS** with one command:
   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh
   ```

This will:
- Commit and push your changes to GitHub
- SSH into your VPS
- Pull the latest code
- Rebuild Docker containers
- Restart the application
- Show deployment status

**The entire process takes about 2-3 minutes.**

## 📊 Monitoring & Logs

### View Live Logs

```bash
# All services
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs -f'

# Backend only
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs -f backend'

# Frontend only
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs -f frontend'
```

### Check Container Status

```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose ps'
```

### Restart Services

```bash
# Restart all
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart'

# Restart backend only
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart backend'
```

## 🔧 Manual Commands

### Access the VPS

```bash
ssh devuser@103.149.105.113
cd /home/devuser/hrautomation
```

### Docker Commands

```bash
# View running containers
docker-compose ps

# Stop all containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f

# Execute Django commands
docker-compose exec backend python manage.py <command>

# Access Django shell
docker-compose exec backend python manage.py shell

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Cleanup

```bash
# Remove old/unused Docker images
docker image prune -f

# Remove all unused Docker resources
docker system prune -a -f
```

## 🌐 Accessing Your Application

- **Frontend**: http://103.149.105.113:5511
- **Backend API**: http://103.149.105.113:5512/api/
- **Admin Panel**: http://103.149.105.113:5512/admin/

## 🔐 Security Considerations

1. **Environment Variables**: 
   - Never commit `.env`, `credentials.json`, or `token.json` to GitHub
   - These files are copied directly to the VPS via SCP

2. **Firewall**:
   - Only ports 22 (SSH), 5511, and 5512 should be open
   - The setup script configures UFW automatically

3. **Django Secret Key**:
   - In production, set a unique SECRET_KEY in your `.env` file:
     ```bash
     SECRET_KEY=your-long-random-secret-key-here
     ```

4. **Debug Mode**:
   - Set `DEBUG=False` in production `.env`

## ⚠️ Troubleshooting

### Containers Won't Start

```bash
# Check logs for errors
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Reset database (⚠️ destroys all data)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### API Not Responding

```bash
# Check if backend is running
docker-compose ps

# Restart backend
docker-compose restart backend

# Check backend logs
docker-compose logs backend
```

### Cannot Connect to VPS

```bash
# Test SSH connection
ssh devuser@103.149.105.113

# Check firewall
ssh devuser@103.149.105.113 'sudo ufw status'

# Ensure ports are open
ssh devuser@103.149.105.113 'sudo ufw allow 5511/tcp && sudo ufw allow 5512/tcp'
```

### Deployment Script Fails

1. Check your GitHub credentials
2. Ensure you have SSH key access to the VPS
3. Verify VPS has internet access
4. Check VPS disk space: `df -h`

## 🔄 Updating Credentials on VPS

If you need to update `.env` or credentials files:

```bash
# Copy new .env
scp .env devuser@103.149.105.113:/home/devuser/hrautomation/.env

# Copy new credentials
scp credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/credentials.json
scp token.json devuser@103.149.105.113:/home/devuser/hrautomation/token.json

# Restart services
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart'
```

## 📝 Development Workflow

1. **Develop locally** - Make changes and test
2. **Commit changes** - Git commits are handled automatically by deploy script
3. **Deploy** - Run `./deploy/deploy.sh`
4. **Verify** - Check the live site
5. **Monitor** - Watch logs if needed

## 🎯 Best Practices

1. **Test locally first** before deploying
2. **Monitor logs** after deployment
3. **Regular backups** of the database:
   ```bash
   scp devuser@103.149.105.113:/home/devuser/hrautomation/backend/db.sqlite3 ./backups/db_backup_$(date +%Y%m%d).sqlite3
   ```
4. **Keep dependencies updated** regularly
5. **Review logs** weekly for any issues

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set
3. Ensure all required files are present
4. Check VPS resources: memory, disk space
5. Review this documentation

## 🔗 Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated**: February 2026
