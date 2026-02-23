#!/bin/bash

# HR Automation Deployment Script
# This script deploys the application to the VPS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_USER="devuser"
VPS_HOST="103.149.105.113"
VPS_PATH="/home/devuser/hrautomation"
REPO_URL="https://github.com/JamillimaJ/hrautomain.git"

echo -e "${GREEN}🚀 Starting HR Automation Deployment${NC}"
echo ""

# Step 1: Push local changes to GitHub
echo -e "${YELLOW}📤 Pushing local changes to GitHub...${NC}"
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin master

# Step 2: SSH into VPS and deploy
echo -e "${YELLOW}🔗 Connecting to VPS and deploying...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    set -e
    cd /home/devuser/hrautomation
    
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin master
    
    echo "🐳 Rebuilding and restarting Docker containers..."
    docker-compose down || true
    docker-compose build --no-cache
    docker-compose up -d
    
    echo "⏳ Waiting for containers to start..."
    sleep 5
    
    echo "🧹 Cleaning up old Docker images..."
    docker image prune -f || true
    
    echo "📊 Checking container status..."
    docker-compose ps
    
    echo ""
    echo "✅ Deployment complete!"
ENDSSH

echo ""
echo -e "${GREEN}✨ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Frontend: http://103.149.105.113:5511${NC}"
echo -e "${GREEN}🔧 Backend API: http://103.149.105.113:5512/api/${NC}"
echo -e "${GREEN}🔐 Admin Panel: http://103.149.105.113:5512/admin/${NC}"
echo ""
echo "📋 View logs with: ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose logs -f'"
