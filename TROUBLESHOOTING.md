# 🔧 Deployment Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "sudo: a terminal is required to read the password"

**Symptom**: When running `./deploy/initial-setup.sh`, you see:
```
sudo: a terminal is required to read the password
```

**Solutions**:

#### Option A: Use Quick Setup (If Docker is already installed)
If Docker is already on your VPS:
```bash
./deploy/quick-setup.sh
```

#### Option B: Manual Docker Installation
SSH into your VPS and install Docker manually:

```bash
# Connect to VPS
ssh devuser@103.149.105.113

# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in
exit
```

Then run from your local machine:
```bash
./deploy/quick-setup.sh
```

#### Option C: Use SSH Password Authentication
If using keys, the script should work. If not, ensure SSH password authentication:

```bash
# Test SSH connection
ssh devuser@103.149.105.113

# If that works, try the setup again
./deploy/initial-setup.sh
```

---

### Issue 2: "permission denied" for Docker Commands

**Symptom**: Docker commands fail with permission errors.

**Solution**: Add your user to the docker group:
```bash
ssh devuser@103.149.105.113
sudo usermod -aG docker devuser
exit

# Log back in for changes to take effect
ssh devuser@103.149.105.113
```

---

### Issue 3: Port Already in Use

**Symptom**: Containers won't start, logs show port binding errors.

**Solution**: Check and stop conflicting services:
```bash
ssh devuser@103.149.105.113

# Check what's using port 5511
sudo lsof -i :5511

# Check what's using port 5512
sudo lsof -i :5512

# Stop conflicting services or change ports in docker-compose.yml
```

---

### Issue 4: Cannot Connect to Application

**Symptom**: Can't access http://103.149.105.113:5511

**Solutions**:

1. **Check if containers are running**:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose ps'
   ```

2. **Check firewall**:
   ```bash
   ssh devuser@103.149.105.113 'sudo ufw status'
   ```
   
   If ports are blocked:
   ```bash
   ssh devuser@103.149.105.113 'sudo ufw allow 5511/tcp && sudo ufw allow 5512/tcp'
   ```

3. **Check container logs**:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs'
   ```

---

### Issue 5: Database Migration Errors

**Symptom**: Backend shows database errors in logs.

**Solution**: Run migrations manually:
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose exec backend python manage.py migrate'
```

If that fails, recreate the database:
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose down -v && docker-compose up -d'
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose exec backend python manage.py migrate'
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose exec backend python manage.py createsuperuser'
```

---

### Issue 6: "Git repository not found" During Deployment

**Symptom**: Deploy script can't clone from GitHub.

**Solution**: Ensure GitHub repository is public or VPS has access:
```bash
# Test from VPS
ssh devuser@103.149.105.113
git clone https://github.com/JamillimaJ/hrautomain.git test-clone
rm -rf test-clone
```

If it fails, the repository might be private. Make it public or set up SSH keys.

---

### Issue 7: Out of Disk Space

**Symptom**: Build or deployment fails with disk space errors.

**Solution**: Clean up Docker resources:
```bash
ssh devuser@103.149.105.113

# Check disk usage
df -h

# Clean up Docker
docker system prune -a -f

# Remove old containers and images
docker container prune -f
docker image prune -a -f
docker volume prune -f
```

---

### Issue 8: Backend Shows 500 Errors

**Symptom**: API returns 500 Internal Server Error.

**Solutions**:

1. **Check backend logs**:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs backend'
   ```

2. **Check .env file**:
   ```bash
   ssh devuser@103.149.105.113 'cat /home/devuser/hrautomation/.env'
   ```
   Ensure all required variables are set.

3. **Check DEBUG mode**:
   Temporarily enable debug to see detailed errors:
   ```bash
   # In .env on VPS
   DEBUG=True
   ```
   Then restart:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart backend'
   ```

---

### Issue 9: Changes Not Reflecting After Deployment

**Symptom**: Deployed changes don't appear on the live site.

**Solutions**:

1. **Hard refresh browser**: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)

2. **Check if containers rebuilt**:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose ps'
   ```
   Look at the "Created" time.

3. **Force rebuild**:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose down && docker-compose build --no-cache && docker-compose up -d'
   ```

---

### Issue 10: SSH Connection Refused

**Symptom**: Can't connect to VPS via SSH.

**Solutions**:

1. **Check VPS is running**: Contact your hosting provider

2. **Check SSH port**: Ensure port 22 is open
   ```bash
   telnet 103.149.105.113 22
   ```

3. **Check SSH key**: Ensure your SSH key is properly configured
   ```bash
   ssh-add -l  # List loaded keys
   ```

---

## Quick Diagnostic Commands

### Check Everything
```bash
# Run this on VPS to check all services
ssh devuser@103.149.105.113 << 'EOF'
  echo "=== Disk Space ==="
  df -h
  
  echo -e "\n=== Docker Status ==="
  docker ps
  
  echo -e "\n=== Container Logs (last 20 lines) ==="
  cd /home/devuser/hrautomation
  docker-compose logs --tail=20
  
  echo -e "\n=== Firewall Status ==="
  sudo ufw status
  
  echo -e "\n=== Ports in Use ==="
  sudo netstat -tlnp | grep -E ':(5511|5512|80|443)'
EOF
```

### Restart Everything
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart'
```

### View Live Logs
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs -f'
```

---

## Getting Help

If none of these solutions work:

1. **Gather information**:
   ```bash
   ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs > /tmp/docker-logs.txt'
   scp devuser@103.149.105.113:/tmp/docker-logs.txt ./
   ```

2. **Check the logs** for specific error messages

3. **Search for the error** online - Docker and Django errors are well-documented

4. **Review configuration**:
   - `.env` file has all required variables
   - `credentials.json` and `token.json` are present (if using Google Drive)
   - Firewall rules are correct
   - Docker has enough resources

---

## Prevention Tips

1. **Test locally first**: Always test with `docker-compose up` locally before deploying

2. **Monitor resources**: Keep an eye on VPS disk space and memory

3. **Regular backups**: Backup your database regularly
   ```bash
   scp devuser@103.149.105.113:/home/devuser/hrautomation/backend/db.sqlite3 ./backup-$(date +%Y%m%d).sqlite3
   ```

4. **Keep logs**: Save deployment logs for troubleshooting

5. **Update regularly**: Keep Docker, system packages, and dependencies updated

---

## Still Stuck?

If you're still having issues:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed documentation
- Review Docker logs carefully
- Ensure all prerequisites are met
- Try the manual deployment steps one by one
