# 🚀 Quick Start - Deployment to VPS

Deploy your HR Automation system to a VPS in 3 simple steps!

## Prerequisites Checklist

- [ ] VPS access: `devuser@103.149.105.113`
- [ ] `.env` file configured with your API keys
- [ ] SSH key setup for password-less login (optional but recommended)

## Step 1: Initial Setup (One-Time)

Run this command from your project root:

```bash
chmod +x deploy/initial-setup.sh && ./deploy/initial-setup.sh
```

This will:
- Install Docker on your VPS ✅
- Clone your code ✅
- Start all services ✅

**Time: ~5-10 minutes**

## Step 2: Create Admin User

```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose exec backend python manage.py createsuperuser'
```

## Step 3: Access Your Application

🌐 **Frontend**: http://103.149.105.113:5511  
🔧 **Backend API**: http://103.149.105.113:5512/api/  
🔐 **Admin Panel**: http://103.149.105.113:5512/admin/

---

## Daily Workflow: Deploy Changes

Made changes locally? Deploy them with:

```bash
./deploy/deploy.sh
```

That's it! Your changes are live in 2-3 minutes.

---

## Helpful Commands

### View Logs
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose logs -f'
```

### Restart Services
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose restart'
```

### Check Status
```bash
ssh devuser@103.149.105.113 'cd /home/devuser/hrautomation && docker-compose ps'
```

---

## 🆘 Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed documentation.

## 🎉 You're All Set!

Your HR Automation system is now:
- ✅ Running on your VPS
- ✅ Auto-deploying when you push changes
- ✅ Accessible from anywhere
- ✅ Running in Docker containers
- ✅ Ready for production use

Happy recruiting! 🎯
