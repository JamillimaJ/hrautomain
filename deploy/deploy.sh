#!/bin/bash

# HR Automation Deployment Script
# This script deploys the application to the VPS

set -e

# Configuration
VPS_USER="devuser"
VPS_IP="103.149.105.113"
VPS_PATH="/home/devuser/hrautomation"
REPO_URL="https://github.com/JamillimaJ/hrautomain.git"

echo "🚀 Starting HR Automation Deployment"
echo "=================================="
echo "VPS: ${VPS_USER}@${VPS_IP}"
echo "Path: ${VPS_PATH}"
echo ""

# Check if SSH connection works
echo "📡 Testing SSH connection..."
ssh -o ConnectTimeout=10 ${VPS_USER}@${VPS_IP} "echo 'SSH connection successful'" || {
    echo "❌ SSH connection failed. Please check your credentials."
    exit 1
}

# Deploy to VPS
echo ""
echo "📦 Deploying to VPS..."
ssh ${VPS_USER}@${VPS_IP} bash <<'ENDSSH'
set -e

VPS_PATH="/home/devuser/hrautomation"
REPO_URL="https://github.com/JamillimaJ/hrautomain.git"

echo "📂 Setting up directory..."
mkdir -p ${VPS_PATH}
cd ${VPS_PATH}

# Clone or pull repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git fetch origin
    git reset --hard origin/master
    git pull origin master
else
    echo "📥 Cloning repository..."
    git clone ${REPO_URL} .
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create it with your credentials."
    echo "Creating template .env file..."
    cat > .env <<'EOF'
# OpenAI API Key
OPENAI_API_KEY=your_openai_key_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Twilio Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=103.149.105.113,localhost

# Hide pygame prompt
PYGAME_HIDE_SUPPORT_PROMPT=1
EOF
    echo "❌ Please edit .env file with your credentials and run deployment again."
    exit 1
fi

# Check if credentials.json exists
if [ ! -f "credentials.json" ]; then
    echo "⚠️  Warning: credentials.json not found. Google Drive integration will not work."
fi

# Check if token.json exists
if [ ! -f "token.json" ]; then
    echo "⚠️  Warning: token.json not found. Google Drive integration will not work."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
cd deploy
docker-compose down || true

# Build and start containers
echo "🏗️  Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Application URLs:"
echo "   Frontend: http://103.149.105.113:5511"
echo "   Backend API: http://103.149.105.113:5512/api/"
echo "   Admin Panel: http://103.149.105.113:5512/admin/"
echo ""
echo "📝 Useful commands:"
echo "   View logs: cd ${VPS_PATH}/deploy && docker-compose logs -f"
echo "   Restart: cd ${VPS_PATH}/deploy && docker-compose restart"
echo "   Stop: cd ${VPS_PATH}/deploy && docker-compose down"
echo ""
ENDSSH

echo ""
echo "✨ Deployment finished successfully!"
echo ""
echo "🔗 Access your application at:"
echo "   Frontend: http://103.149.105.113:5511"
echo "   Backend API: http://103.149.105.113:5512/api/"
echo "   Admin Panel: http://103.149.105.113:5512/admin/"
