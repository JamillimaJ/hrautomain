# 🚀 HR Automation - Docker Deployment Quick Reference

## ✅ What's Been Done

1. ✅ **Dockerized** - Backend and Frontend containerized
2. ✅ **Port Configuration** - Frontend: 5511, Backend: 5512
3. ✅ **Auto-Detection** - Frontend automatically detects VPS vs local environment
4. ✅ **Environment Variables** - Django uses .env for configuration
5. ✅ **Relative Paths** - All paths are container-friendly
6. ✅ **Volume Mounting** - Changes reflect instantly without rebuilding
7. ✅ **Deployment Scripts** - One-command deployment and updates
8. ✅ **Security** - Sensitive files excluded from git
9. ✅ **Documentation** - Complete guides created
10. ✅ **All changes pushed to GitHub** ✨

## 📍 Your Setup Details

- **Repository**: https://github.com/JamillimaJ/hrautomain.git
- **VPS**: devuser@103.149.105.113
- **VPS Path**: /home/devuser/hrautomation
- **Frontend URL**: http://103.149.105.113:5511
- **Backend URL**: http://103.149.105.113:5512/api/
- **Admin Panel**: http://103.149.105.113:5512/admin/

## 🎯 Your Workflow (3 Simple Steps)

### Step 1: Initial Deployment (ONE TIME ONLY)

```bash
cd /home/jamil/Documents/Jamil/betopia/hrautomain/deploy
./deploy.sh
```

After deployment completes, copy sensitive files to VPS:

```bash
# Copy your credentials (from local machine)
scp ../.env devuser@103.149.105.113:/home/devuser/hrautomation/
scp ../credentials.json devuser@103.149.105.113:/home/devuser/hrautomation/
scp ../token.json devuser@103.149.105.113:/home/devuser/hrautomation/
```

Then restart containers:

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart"
```

Create admin user:

```bash
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py createsuperuser"
```

### Step 2: Make Changes Locally

Edit any file in your project:
- Frontend: `/home/jamil/Documents/Jamil/betopia/hrautomain/frontend/`
- Backend: `/home/jamil/Documents/Jamil/betopia/hrautomain/backend/`
- Source: `/home/jamil/Documents/Jamil/betopia/hrautomain/src/`

### Step 3: Deploy Changes to VPS

```bash
cd /home/jamil/Documents/Jamil/betopia/hrautomain/deploy
./update.sh
```

**That's it!** Changes are now live 🎉

## 📚 Important Files

### Deployment Files (in `deploy/` folder):
- `deploy.sh` - Initial deployment script
- `update.sh` - Quick update script (use this daily)
- `docker-compose.yml` - Docker orchestration
- `Dockerfile.backend` - Backend container definition
- `Dockerfile.frontend` - Frontend container definition
- `README.md` - Quick start guide
- `DEPLOYMENT_GUIDE.md` - Comprehensive guide

### Configuration Files:
- `.env` - Environment variables (API keys, secrets)
- `.env.example` - Template for .env
- `.gitignore` - Prevents committing sensitive files
- `.dockerignore` - Optimizes Docker builds

### Updated Files:
- `frontend/js/app.js` - Auto-detects API URL based on environment
- `backend/app/settings.py` - Uses environment variables

## 🔥 Common Commands

```bash
# Deploy changes
cd deploy && ./update.sh

# View logs
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose logs -f"

# Restart services
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart"

# Check status
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose ps"

# Stop everything
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose down"

# Start everything
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose up -d"
```

## ⚠️ Important Notes

1. **Sensitive Files**: Never commit `.env`, `credentials.json`, `token.json`, or `*.sqlite3` to git
2. **First Deployment**: Must manually copy sensitive files to VPS via SCP
3. **Environment Variables**: Update `.env` on VPS when you change API keys locally
4. **Volumes**: Code changes are live because of volume mounting
5. **Disk Space**: VPS has 10GB - clean Docker occasionally: `docker system prune -a`

## 🆘 Troubleshooting

### Can't access the app?
```bash
# Check if containers are running
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose ps"

# Check logs
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose logs"

# Restart everything
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose restart"
```

### Changes not showing?
```bash
# Force update
cd deploy && ./update.sh
```

### Database issues?
```bash
# Run migrations
ssh devuser@103.149.105.113 "cd /home/devuser/hrautomation/deploy && docker-compose exec backend python manage.py migrate"
```

## 📖 Documentation

- **Quick Start**: `deploy/README.md` ⭐ START HERE
- **Detailed Guide**: `deploy/DEPLOYMENT_GUIDE.md`
- **Project Info**: `README.md` (root)

## 🎉 You're All Set!

Your project is now:
- ✅ Dockerized
- ✅ Configured for VPS (ports 5511 & 5512)
- ✅ Using relative paths
- ✅ Ready for deployment
- ✅ Pushed to GitHub

**Next Steps:**
1. Test locally first (optional)
2. Run `cd deploy && ./deploy.sh` for initial deployment
3. Copy sensitive files to VPS
4. Access your app at http://103.149.105.113:5511

**Daily Workflow:**
- Make changes locally
- Run `cd deploy && ./update.sh`
- Done! 🚀

---

**Need Help?** Check `deploy/README.md` or `deploy/DEPLOYMENT_GUIDE.md` for detailed instructions.
