#!/bin/bash

# =============================================================================
# AWS EC2 Instance Setup Script for CEMSE Next.js Application (Amazon Linux 2023)
# =============================================================================
# This script prepares an Amazon Linux 2023 EC2 instance for deploying the CEMSE 
# application with all required dependencies and services.
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    error "This script requires sudo privileges. Please ensure your user has sudo access."
    exit 1
fi

log "🚀 Starting AWS EC2 setup for CEMSE application..."

# =============================================================================
# 1. SYSTEM UPDATE AND BASIC TOOLS
# =============================================================================
log "📦 Updating system packages..."
sudo dnf update -y

log "🔧 Installing basic development tools..."
# Use --skip-broken to handle potential package conflicts
sudo dnf install -y --skip-broken \
    curl \
    wget \
    git \
    unzip \
    ca-certificates \
    gcc \
    gcc-c++ \
    make \
    python3 \
    python3-pip \
    htop \
    nano \
    vim \
    tree \
    jq \
    openssl \
    openssl-devel \
    glibc-devel \
    libstdc++-devel \
    tar \
    gzip

# Note: gnupg2-minimal is already installed on Amazon Linux 2023, so we skip full gnupg2

# =============================================================================
# 2. NODE.JS AND PNPM INSTALLATION
# =============================================================================
log "📦 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

log "📦 Installing pnpm package manager..."
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Add pnpm to PATH for current session
export PATH="$HOME/.local/share/pnpm:$PATH"

log "✅ Node.js version: $(node --version)"
log "✅ NPM version: $(npm --version)"

# Install pnpm globally via npm if the curl method didn't work
if ! command -v pnpm &> /dev/null; then
    warn "pnpm not found, installing via npm..."
    sudo npm install -g pnpm
fi

log "✅ pnpm version: $(pnpm --version)"

# =============================================================================
# 3. DOCKER INSTALLATION
# =============================================================================
log "🐳 Installing Docker..."

# Remove old versions if they exist
sudo dnf remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true

# Install Docker from Amazon Linux 2023 repositories
sudo dnf install -y docker

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

log "✅ Docker version: $(docker --version)"

# =============================================================================
# 4. DOCKER COMPOSE INSTALLATION
# =============================================================================
log "🐳 Installing Docker Compose standalone..."

# Get latest version of Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

log "✅ Docker Compose version: $(docker-compose --version)"

# =============================================================================
# 5. FFMPEG INSTALLATION (for video processing)
# =============================================================================
log "🎥 Installing FFmpeg for video processing..."
# For Amazon Linux 2023, try installing ffmpeg directly or from RPM Fusion
if ! sudo dnf install -y ffmpeg ffmpeg-devel 2>/dev/null; then
    warn "FFmpeg not available in default repos, installing from RPM Fusion..."
    # Install RPM Fusion for FFmpeg
    sudo dnf install -y --nogpgcheck \
        https://download1.rpmfusion.org/free/el/rpmfusion-free-release-9.noarch.rpm \
        https://download1.rpmfusion.org/nonfree/el/rpmfusion-nonfree-release-9.noarch.rpm 2>/dev/null || true
    
    # Try installing ffmpeg again
    if ! sudo dnf install -y ffmpeg ffmpeg-devel 2>/dev/null; then
        warn "Could not install FFmpeg from repositories. You may need to install it manually later."
        warn "Alternative: compile from source or use static builds from https://johnvansickle.com/ffmpeg/"
    fi
fi

# Check if ffmpeg is available before showing version
if command -v ffmpeg &> /dev/null; then
    log "✅ FFmpeg version: $(ffmpeg -version | head -1)"
else
    warn "❌ FFmpeg not installed - you may need to install it manually for video processing"
fi

# =============================================================================
# 6. POSTGRESQL CLIENT TOOLS
# =============================================================================
log "🗄️ Installing PostgreSQL client tools..."
sudo dnf install -y postgresql15

log "✅ PostgreSQL client version: $(psql --version)"

# =============================================================================
# 7. REDIS CLIENT TOOLS
# =============================================================================
log "🔴 Installing Redis client tools..."
# Try different Redis package names for Amazon Linux 2023
if ! sudo dnf install -y redis 2>/dev/null; then
    if ! sudo dnf install -y redis6 2>/dev/null; then
        if ! sudo dnf install -y redis-cli 2>/dev/null; then
            warn "Redis not available in default repos, installing from EPEL..."
            # Try installing EPEL for Amazon Linux 2023
            sudo dnf install -y amazon-linux-extras 2>/dev/null || true
            sudo dnf config-manager --enable epel 2>/dev/null || true
            
            if ! sudo dnf install -y redis 2>/dev/null; then
                warn "Could not install Redis from repositories."
                warn "Redis will be available via Docker containers in the application setup."
                warn "You can manually install redis-cli later if needed."
            fi
        fi
    fi
fi

# Check if redis-cli is available before showing version
if command -v redis-cli &> /dev/null; then
    log "✅ Redis CLI version: $(redis-cli --version)"
else
    warn "❌ Redis CLI not installed - will use Docker Redis container"
fi

# =============================================================================
# 8. NGINX INSTALLATION (for reverse proxy)
# =============================================================================
log "🌐 Installing Nginx..."
sudo dnf install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

log "✅ Nginx version: $(nginx -v 2>&1)"

# =============================================================================
# 9. SSL CERTIFICATE TOOLS (Let's Encrypt)
# =============================================================================
log "🔒 Installing Certbot for SSL certificates..."
sudo dnf install -y certbot python3-certbot-nginx

log "✅ Certbot version: $(certbot --version)"

# =============================================================================
# 10. FIREWALL CONFIGURATION
# =============================================================================
log "🔥 Configuring firewalld..."

# Install and start firewalld
sudo dnf install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow SSH (usually already enabled)
sudo firewall-cmd --permanent --add-service=ssh

# Allow HTTP and HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow Next.js application port
sudo firewall-cmd --permanent --add-port=3000/tcp

# Allow PostgreSQL (only from localhost for security)
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='127.0.0.1' port protocol='tcp' port='5432' accept"

# Allow Redis (only from localhost for security)
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='127.0.0.1' port protocol='tcp' port='6379' accept"

# Allow MinIO (only from localhost for security)
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='127.0.0.1' port protocol='tcp' port='9000' accept"
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='127.0.0.1' port protocol='tcp' port='9001' accept"

# Reload firewall rules
sudo firewall-cmd --reload

log "✅ Firewall configured"

# =============================================================================
# 11. CREATE APPLICATION DIRECTORIES
# =============================================================================
log "📁 Creating application directories..."

# Create app directory
sudo mkdir -p /opt/cemse
sudo chown $USER:$USER /opt/cemse

# Create logs directory
sudo mkdir -p /var/log/cemse
sudo chown $USER:$USER /var/log/cemse

# Create uploads directory
sudo mkdir -p /opt/cemse/public/uploads
sudo chown -R $USER:$USER /opt/cemse/public

log "✅ Application directories created"

# =============================================================================
# 12. ENVIRONMENT CONFIGURATION
# =============================================================================
log "⚙️ Setting up environment configuration..."

# Create environment file template
cat > /opt/cemse/.env.example << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cemse_prod"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/cemse_prod"

# Application Configuration
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="https://cemse.boring.lat"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="your-minio-access-key"
MINIO_SECRET_KEY="your-minio-secret-key"
MINIO_USE_SSL=false
MINIO_BASE_URL="http://localhost:9000"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
EOF

log "✅ Environment configuration template created"

# =============================================================================
# 13. SYSTEMD SERVICE CONFIGURATION
# =============================================================================
log "🔧 Creating systemd service for CEMSE application..."

sudo tee /etc/systemd/system/cemse.service > /dev/null << EOF
[Unit]
Description=CEMSE Next.js Application
After=network.target
Requires=docker.service
After=docker.service

[Service]
Type=forking
User=$USER
Group=$USER
WorkingDirectory=/opt/cemse
Environment=NODE_ENV=production
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
ExecReload=/usr/local/bin/docker-compose -f docker-compose.prod.yml restart
TimeoutStartSec=300
TimeoutStopSec=120
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

log "✅ Systemd service created"

# =============================================================================
# 14. NGINX REVERSE PROXY CONFIGURATION
# =============================================================================
log "🌐 Creating Nginx reverse proxy configuration..."

sudo tee /etc/nginx/conf.d/cemse.conf > /dev/null << EOF
server {
    listen 80 default_server;
    server_name _;
    
    # For initial setup, serve the app directly on HTTP
    # After SSL setup, this block will redirect to HTTPS
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/atom+xml image/svg+xml;
    
    # Client max body size (for file uploads)
    client_max_body_size 100M;
    
    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static file serving optimization
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/cemse_access.log;
    error_log /var/log/nginx/cemse_error.log;
}

# HTTPS server block (commented out until SSL certificates are installed)
# Uncomment and configure after running certbot
#
# server {
#     listen 443 ssl;
#     http2 on;
#     server_name cemse.boring.lat;
#     
#     # SSL configuration (to be configured with certbot)
#     ssl_certificate /etc/letsencrypt/live/cemse.boring.lat/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/cemse.boring.lat/privkey.pem;
#     
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
#     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
#     
#     # Gzip compression
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/atom+xml image/svg+xml;
#     
#     # Client max body size (for file uploads)
#     client_max_body_size 100M;
#     
#     # Proxy to Next.js application
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#         proxy_read_timeout 86400;
#     }
#     
#     # Static file serving optimization
#     location /_next/static/ {
#         proxy_pass http://localhost:3000;
#         proxy_set_header Host \$host;
#         proxy_cache_valid 200 1y;
#         add_header Cache-Control "public, immutable";
#     }
#     
#     # Logs
#     access_log /var/log/nginx/cemse_access.log;
#     error_log /var/log/nginx/cemse_error.log;
# }
EOF

# Remove default server block if it exists
sudo rm -f /etc/nginx/conf.d/default.conf

# Test nginx configuration
sudo nginx -t

# Restart Nginx to load the new configuration
sudo systemctl restart nginx

log "✅ Nginx reverse proxy configuration created"

# =============================================================================
# 15. LOG ROTATION CONFIGURATION
# =============================================================================
log "📝 Setting up log rotation..."

sudo tee /etc/logrotate.d/cemse > /dev/null << EOF
/var/log/cemse/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    postrotate
        systemctl reload cemse || true
    endscript
}

/var/log/nginx/cemse_*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 nginx nginx
    postrotate
        systemctl reload nginx || true
    endscript
}
EOF

log "✅ Log rotation configured"

# =============================================================================
# 16. MONITORING TOOLS INSTALLATION
# =============================================================================
log "📊 Installing monitoring tools..."

# Install htop and iotop for system monitoring
sudo dnf install -y htop iotop

# Install Docker stats tools
docker --version > /dev/null 2>&1 || error "Docker installation failed"

log "✅ Monitoring tools installed"

# =============================================================================
# 17. SYSTEM OPTIMIZATION
# =============================================================================
log "⚡ Applying system optimizations..."

# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "root soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "root hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Set kernel parameters for better performance
sudo tee -a /etc/sysctl.conf > /dev/null << EOF

# CEMSE Application Optimizations
vm.swappiness=1
net.core.somaxconn=1024
net.core.netdev_max_backlog=5000
net.core.rmem_default=262144
net.core.rmem_max=16777216
net.core.wmem_default=262144
net.core.wmem_max=16777216
net.ipv4.tcp_rmem=4096 87380 16777216
net.ipv4.tcp_wmem=4096 65536 16777216
net.ipv4.tcp_congestion_control=bbr
EOF

log "✅ System optimizations applied"

# =============================================================================
# 18. CREATE DEPLOYMENT SCRIPTS
# =============================================================================
log "📜 Creating deployment helper scripts..."

# Deployment script
cat > /opt/cemse/deploy.sh << 'EOF'
#!/bin/bash
set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 Starting CEMSE application deployment..."

# Pull latest changes
if [ -d .git ]; then
    log "📥 Pulling latest changes from git..."
    git pull
fi

# Install/update dependencies
log "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
log "🔧 Generating Prisma client..."
pnpm prisma generate

# Run database migrations
log "🗄️ Running database migrations..."
pnpm prisma migrate deploy

# Build application
log "🏗️ Building application..."
pnpm build

# Restart services
log "🔄 Restarting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

log "✅ Deployment completed successfully!"
EOF

chmod +x /opt/cemse/deploy.sh

# Backup script
cat > /opt/cemse/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/cemse/backups"
DATE=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "💾 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
log "🗄️ Backing up database..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres cemse_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
log "📁 Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz public/uploads/

# Backup environment file
log "⚙️ Backing up environment configuration..."
cp .env $BACKUP_DIR/env_backup_$DATE

# Clean old backups (keep last 7 days)
log "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +7 -delete

log "✅ Backup completed successfully!"
EOF

chmod +x /opt/cemse/backup.sh

# Health check script
cat > /opt/cemse/health-check.sh << 'EOF'
#!/bin/bash

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check if application is responding
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    log "✅ Application is healthy"
    exit 0
else
    log "❌ Application is not responding"
    exit 1
fi
EOF

chmod +x /opt/cemse/health-check.sh

log "✅ Deployment helper scripts created"

# =============================================================================
# 19. FINAL INSTRUCTIONS
# =============================================================================
log "🎉 Amazon Linux 2023 EC2 setup completed successfully!"

echo ""
echo "========================================="
echo "🚀 CEMSE AWS EC2 Setup Complete!"
echo "🐧 Amazon Linux 2023"
echo "========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Clone your repository:"
echo "   cd /opt/cemse"
echo "   git clone https://github.com/boring-ventures/cemse.git ."
echo ""
echo "2. Copy and configure environment variables:"
echo "   cp .env.example .env"
echo "   nano .env  # Edit with your actual values"
echo ""
echo "3. Update Nginx configuration for your subdomain (optional):"
echo "   sudo nano /etc/nginx/conf.d/cemse.conf"
echo "   # Already configured for cemse.boring.lat subdomain"
echo ""
echo "4. Restart Nginx:"
echo "   sudo systemctl restart nginx"
echo ""
echo "5. Deploy the application:"
echo "   ./deploy.sh"
echo ""
echo "6. Configure SSL certificate for your subdomain:"
echo "   sudo certbot --nginx -d cemse.boring.lat"
echo ""
echo "7. After SSL setup, update Nginx config for HTTPS redirect:"
echo "   sudo nano /etc/nginx/conf.d/cemse.conf"
echo "   # Uncomment the HTTPS server block"
echo "   # Change HTTP block to redirect to HTTPS:"
echo "   # return 301 https://\$server_name\$request_uri;"
echo ""
echo "8. Enable automatic startup:"
echo "   sudo systemctl enable cemse"
echo ""
echo "📊 Useful Commands:"
echo "   - Deploy: ./deploy.sh"
echo "   - Backup: ./backup.sh"
echo "   - Health check: ./health-check.sh"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - System status: sudo systemctl status cemse"
echo ""
echo "🔧 Services Information:"
echo "   - Application: http://localhost:3000"
echo "   - Database: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - MinIO: http://localhost:9000"
echo "   - MinIO Console: http://localhost:9001"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Please reboot the system to apply all changes"
echo "   - Update firewall rules if needed for your specific setup"
echo "   - Change default passwords for security"
echo "   - Configure SSL certificates for production"
echo ""

warn "🔄 Please reboot your Amazon Linux 2023 system now to apply all changes:"
warn "sudo reboot"
echo ""
echo "💡 Amazon Linux 2023 specific notes:"
echo "   - Uses dnf package manager instead of apt"
echo "   - Uses firewalld instead of ufw for firewall management"
echo "   - Some package names may differ from Ubuntu/Debian systems"