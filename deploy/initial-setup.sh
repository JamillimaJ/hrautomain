#!/bin/bash

# Initial VPS Setup Script
# Run this script ONCE on your local machine to set up the VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VPS_USER="devuser"
VPS_HOST="103.149.105.113"
VPS_PATH="/home/devuser/hrautomation"
REPO_URL="https://github.com/JamillimaJ/hrautomain.git"

echo -e "${GREEN}🔧 Setting up VPS for HR Automation${NC}"
echo ""

# Step 1: Install Docker and Docker Compose on VPS
echo -e "${YELLOW}📦 Installing Docker and Docker Compose on VPS...${NC}"
echo ""
echo "Creating installation script on VPS..."

# Create installation script on VPS
ssh ${VPS_USER}@${VPS_HOST} 'cat > /tmp/install-docker.sh << "EOF"
#!/bin/bash
set -e

echo "Updating system packages..."
sudo apt-get update -qq

echo "Installing prerequisites..."
sudo apt-get install -y -qq apt-transport-https ca-certificates curl software-properties-common git

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    sudo usermod -aG docker $USER
    rm /tmp/get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

echo ""
echo "✅ Docker installation complete!"
echo "Note: You may need to log out and back in for Docker group changes to take effect"
EOF
chmod +x /tmp/install-docker.sh'

echo "Running installation script (will prompt for sudo password)..."
ssh -t ${VPS_USER}@${VPS_HOST} '/tmp/install-docker.sh && rm /tmp/install-docker.sh'

# Step 2: Clone repository
echo -e "${YELLOW}📥 Cloning repository to VPS...${NC}"
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
    
    echo "✅ Repository cloned"
ENDSSH

# Step 3: Copy sensitive files (.env, credentials, tokens)
echo -e "${YELLOW}🔐 Copying sensitive configuration files...${NC}"
scp .env ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/.env
scp credentials.json ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/credentials.json
scp token.json ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/token.json

# Step 4: Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    cd ${VPS_PATH}
    mkdir -p data/resumes outputs/appointment_letters outputs/excel_reports
ENDSSH

# Step 5: Build and start Docker containers
echo -e "${YELLOW}🐳 Building and starting Docker containers...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
    cd ${VPS_PATH}
    docker-compose build
    docker-compose up -d
    
    echo "Waiting for containers to start..."
    sleep 5
    
    echo "Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    
    echo "📊 Container status:"
    docker-compose ps
ENDSSH

# Step 6: Configure firewall (if needed)
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"

# Create firewall script on VPS
ssh ${VPS_USER}@${VPS_HOST} 'cat > /tmp/setup-firewall.sh << "EOF"
#!/bin/bash
if command -v ufw &> /dev/null; then
    echo "Configuring UFW firewall..."
    sudo ufw allow 5511/tcp
    sudo ufw allow 5512/tcp
    sudo ufw allow 22/tcp
    sudo ufw --force enable 2>/dev/null || echo "Note: Firewall may already be configured"
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping firewall configuration"
fi
EOF
chmod +x /tmp/setup-firewall.sh'

ssh -t ${VPS_USER}@${VPS_HOST} '/tmp/setup-firewall.sh && rm /tmp/setup-firewall.sh'

echo ""
echo -e "${GREEN}✨ Initial setup complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Your application is now running at:${NC}"
echo -e "${GREEN}   Frontend: http://103.149.105.113:5511${NC}"
echo -e "${GREEN}   Backend API: http://103.149.105.113:5512/api/${NC}"
echo -e "${GREEN}   Admin Panel: http://103.149.105.113:5512/admin/${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Create Django superuser: ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose exec backend python manage.py createsuperuser'"
echo "2. To deploy future changes, run: ./deploy/deploy.sh"
echo "3. View logs: ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_PATH} && docker-compose logs -f'"
echo ""
echo -e "${RED}⚠️  Important: You may need to log out and back in for Docker group changes to take effect${NC}"
