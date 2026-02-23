#!/bin/bash

# Quick Setup Script (Assumes Docker is already installed)
# Run this if Docker is already on your VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VPS_USER="devuser"
VPS_HOST="103.149.105.113"
VPS_PATH="/home/devuser/hrautomation"
REPO_URL="https://github.com/JamillimaJ/hrautomain.git"

echo -e "${GREEN}🚀 Quick Setup for HR Automation (Docker already installed)${NC}"
echo ""

# Check if Docker is installed on VPS
echo -e "${YELLOW}Checking Docker installation...${NC}"
if ssh ${VPS_USER}@${VPS_HOST} 'command -v docker &> /dev/null'; then
    echo "✅ Docker is installed"
else
    echo "❌ Docker not found. Please run ./deploy/initial-setup.sh instead"
    exit 1
fi

if ssh ${VPS_USER}@${VPS_HOST} 'command -v docker-compose &> /dev/null'; then
    echo "✅ Docker Compose is installed"
else
    echo "❌ Docker Compose not found. Please run ./deploy/initial-setup.sh instead"
    exit 1
fi

# Step 1: Clone repository
echo ""
echo -e "${YELLOW}📥 Setting up repository on VPS...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    set -e
    
    # Remove existing directory if it exists
    if [ -d "${VPS_PATH}" ]; then
        echo "Removing existing directory..."
        rm -rf ${VPS_PATH}
    fi
    
    # Clone repository
    echo "Cloning repository..."
    git clone ${REPO_URL} ${VPS_PATH}
    cd ${VPS_PATH}
    
    # Create necessary directories
    mkdir -p data/resumes outputs/appointment_letters outputs/excel_reports
    
    echo "✅ Repository cloned"
ENDSSH

# Step 2: Copy sensitive files
echo ""
echo -e "${YELLOW}🔐 Copying configuration files...${NC}"
scp .env ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/.env
scp credentials.json ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/credentials.json 2>/dev/null || echo "Note: credentials.json not found (optional)"
scp token.json ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/token.json 2>/dev/null || echo "Note: token.json not found (optional)"

# Step 3: Build and start containers
echo ""
echo -e "${YELLOW}🐳 Building and starting Docker containers...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    cd ${VPS_PATH}
    
    echo "Building containers..."
    docker-compose build
    
    echo "Starting containers..."
    docker-compose up -d
    
    echo "Waiting for services to start..."
    sleep 8
    
    echo "Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    
    echo ""
    echo "📊 Container status:"
    docker-compose ps
ENDSSH

echo ""
echo -e "${GREEN}✨ Quick setup complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Your application is now running at:${NC}"
echo -e "${GREEN}   Frontend: http://103.149.105.113:5511${NC}"
echo -e "${GREEN}   Backend API: http://103.149.105.113:5512/api/${NC}"
echo -e "${GREEN}   Admin Panel: http://103.149.105.113:5512/admin/${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Create Django superuser:"
echo "   ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose exec backend python manage.py createsuperuser'"
echo ""
echo "2. To deploy future changes, run:"
echo "   ./deploy/deploy.sh"
echo ""
echo "3. View logs:"
echo "   ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose logs -f'"
