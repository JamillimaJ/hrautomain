#!/bin/bash

# Quick Update Script
# Use this to push local changes and update the VPS

set -e

# Configuration
VPS_USER="devuser"
VPS_IP="103.149.105.113"
VPS_PATH="/home/devuser/hrautomation"
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Updating HR Automation System"
echo "================================"
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 You have uncommitted changes. Committing..."
    echo ""
    
    # Show changed files
    git status -s
    echo ""
    
    # Ask for commit message
    read -p "Enter commit message (or press Enter for auto-generated): " COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Commit and push
    git add -A
    git commit -m "$COMMIT_MSG"
    git push origin master
    
    echo "✅ Changes pushed to GitHub"
else
    echo "ℹ️  No local changes to commit"
    git push origin master 2>/dev/null || echo "Already up to date"
fi

echo ""
echo "🚀 Syncing to VPS..."
echo ""

# Sync files from local to VPS using rsync
rsync -avz --progress \
    --exclude '.git' \
    --exclude '.gitignore' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude 'venv' \
    --exclude '.venv' \
    --exclude 'env' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude 'credentials.json' \
    --exclude 'token.json' \
    --exclude '*.sqlite3' \
    --exclude 'db.sqlite3' \
    --exclude '.DS_Store' \
    --exclude '.vscode' \
    --exclude '.idea' \
    "${LOCAL_PATH}/" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

echo ""
echo "✅ Files synced!"

# Update VPS
echo ""
echo "🔄 Restarting containers..."
echo ""

ssh ${VPS_USER}@${VPS_IP} bash <<'ENDSSH'
set -e

VPS_PATH="/home/devuser/hrautomation"

echo "📂 Navigating to project directory..."
cd ${VPS_PATH}

echo "🔄 Restarting containers..."
cd deploy
docker-compose down
docker-compose up -d --build

echo "⏳ Waiting for services to restart..."
sleep 10

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ Update complete!"
ENDSSH

echo ""
echo "✨ Your changes are now live!"
echo ""
echo "🔗 Frontend: http://103.149.105.113:5511"
echo "🔗 Backend API: http://103.149.105.113:5512/api/"
