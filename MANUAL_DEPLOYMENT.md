# 📖 Manual Deployment Guide

If the automated scripts aren't working, follow this step-by-step manual process.

## Prerequisites

- VPS: `devuser@103.149.105.113`
- GitHub repository: `https://github.com/JamillimaJ/hrautomain.git`
- `.env` file configured locally

---

## Step 1: Install Docker on VPS

SSH into your VPS:
```bash
ssh devuser@103.149.105.113
```

Run these commands on the VPS:

### Install Docker
```bash
# Update system
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common git

# Download and install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Clean up
rm get-docker.sh
```

### Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Log out and back in
```bash
exit
```

Then SSH back in:
```bash
ssh devuser@103.149.105.113
```

Verify Docker works without sudo:
```bash
docker ps
```

---

## Step 2: Clone Repository on VPS

Still on the VPS, run:

```bash
# Remove existing directory if present
rm -rf /home/devuser/hrautomation

# Clone repository
git clone https://github.com/JamillimaJ/hrautomain.git /home/devuser/hrautomation

# Navigate to directory
cd /home/devuser/hrautomation

# Create necessary directories
mkdir -p data/resumes outputs/appointment_letters outputs/excel_reports
```

---

## Step 3: Copy Configuration Files

**From your local machine**, run these commands:

### Copy .env file
```bash
scp .env devuser@103.149.105.113:/home/devuser/hrautomation/.env
```

### Copy credentials.json (optional, for Google Drive)
```bash
scp credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/credentials.json
```

### Copy token.json (optional, for Google Drive)
```bash
scp token.json devuser@103.149.105.113:/home/devuser/hrautomation/token.json
```

---

## Step 4: Configure Firewall

**Back on the VPS**, configure the firewall:

```bash
# Allow required ports
sudo ufw allow 22/tcp
sudo ufw allow 5511/tcp
sudo ufw allow 5512/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

## Step 5: Build and Start Docker Containers

On the VPS:

```bash
cd /home/devuser/hrautomation

# Build containers
docker-compose build

# Start containers in background
docker-compose up -d

# Wait for services to start
sleep 10

# Check if containers are running
docker-compose ps
```

You should see two containers running:
- `hrautomain_backend` (port 5512)
- `hrautomain_frontend` (port 5511)

---

## Step 6: Run Database Migrations

```bash
cd /home/devuser/hrautomation

# Run migrations
docker-compose exec backend python manage.py migrate
```

---

## Step 7: Create Superuser

```bash
cd /home/devuser/hrautomation

# Create admin user
docker-compose exec backend python manage.py createsuperuser
```

Follow the prompts to create your admin account.

---

## Step 8: Verify Deployment

### Check Container Logs
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View backend logs only
docker-compose logs backend

# View frontend logs only
docker-compose logs frontend
```

### Access Your Application

Open in your browser:
- **Frontend**: http://103.149.105.113:5511
- **Backend API**: http://103.149.105.113:5512/api/
- **Admin Panel**: http://103.149.105.113:5512/admin/

---

## Step 9: Test the Application

1. Go to http://103.149.105.113:5511
2. You should see the HR Automation dashboard
3. Log in to admin panel: http://103.149.105.113:5512/admin/
4. Use the credentials you created in Step 7

---

## Daily Updates: Deploying Changes

When you make changes locally and want to deploy them:

### Step 1: Push to GitHub (from local machine)
```bash
cd ~/Documents/Jamil/betopia/hrautomain
git add .
git commit -m "Your commit message"
git push origin master
```

### Step 2: Pull and Rebuild on VPS
```bash
# SSH into VPS
ssh devuser@103.149.105.113

# Navigate to project
cd /home/devuser/hrautomation

# Pull latest changes
git pull origin master

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check status
docker-compose ps

# Exit VPS
exit
```

---

## Useful Commands

### On VPS

```bash
# Navigate to project
cd /home/devuser/hrautomation

# View running containers
docker-compose ps

# View logs (live)
docker-compose logs -f

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Execute Django commands
docker-compose exec backend python manage.py <command>

# Access Django shell
docker-compose exec backend python manage.py shell

# Create new migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Check container resource usage
docker stats
```

### Cleanup Commands

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove everything unused
docker system prune -a -f

# Check disk usage
df -h
du -sh /home/devuser/hrautomation
```

---

## Troubleshooting

### Containers Won't Start

```bash
# Check logs for errors
docker-compose logs

# Try rebuilding from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :5511
sudo lsof -i :5512

# Kill the process if needed
sudo kill -9 <PID>
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a -f
```

### Database Issues

```bash
# Backup database first
cp backend/db.sqlite3 backend/db.sqlite3.backup

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Can't Access Application

1. Check firewall: `sudo ufw status`
2. Check containers: `docker-compose ps`
3. Check logs: `docker-compose logs`
4. Restart services: `docker-compose restart`

---

## Backup and Restore

### Backup Database

```bash
# From local machine
scp devuser@103.149.105.113:/home/devuser/hrautomation/backend/db.sqlite3 ./backup-$(date +%Y%m%d).sqlite3
```

### Restore Database

```bash
# Copy backup to VPS
scp ./backup-20260223.sqlite3 devuser@103.149.105.113:/home/devuser/hrautomation/backend/db.sqlite3

# Restart backend
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart backend'
```

---

## Security Checklist

- [ ] Firewall is enabled and configured
- [ ] Only necessary ports are open (22, 5511, 5512)
- [ ] `.env` file contains secure values
- [ ] `DEBUG=False` in production `.env`
- [ ] Strong `SECRET_KEY` in `.env`
- [ ] Django superuser password is strong
- [ ] Regular backups are scheduled
- [ ] System packages are updated regularly

---

## Monitoring

### Check Application Health

```bash
# Check if services respond
curl http://103.149.105.113:5511
curl http://103.149.105.113:5512/api/

# Check container health
docker-compose ps

# Check resource usage
docker stats --no-stream

# Check system resources
htop  # or top
df -h
free -h
```

### Set Up Log Rotation

```bash
# Docker handles log rotation automatically
# Check log sizes
sudo du -sh /var/lib/docker/containers/*/*-json.log
```

---

## Next Steps After Successful Deployment

1. ✅ Application is running
2. ✅ Admin account created
3. ✅ Firewall configured
4. ✅ Services accessible

Now you can:
- Upload resumes via the web interface
- Create job descriptions
- Analyze candidates
- Send notifications
- Generate reports

---

## Getting Help

If you're stuck:
1. Check the logs: `docker-compose logs -f`
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Ensure all steps were followed correctly
4. Check VPS has enough resources (RAM, disk space)
5. Verify network connectivity

---

**That's it! Your HR Automation system should now be running on your VPS.** 🎉
