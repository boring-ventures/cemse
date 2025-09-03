#!/bin/bash
set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

warn() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1" >&2
}

# Function to check and create swap if needed
setup_swap() {
    # Check if swap already exists
    if swapon --show | grep -q '/swapfile'; then
        log "✅ Swap file already exists"
        return 0
    fi
    
    # Check available memory
    MEMORY_KB=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    
    if [ $MEMORY_GB -lt 3 ]; then
        log "🔄 Low memory detected (${MEMORY_GB}GB). Creating swap file..."
        
        # Create 2GB swap file
        if sudo fallocate -l 2G /swapfile 2>/dev/null; then
            sudo chmod 600 /swapfile
            sudo mkswap /swapfile >/dev/null 2>&1
            sudo swapon /swapfile
            
            # Make swap permanent if not already in fstab
            if ! grep -q '/swapfile' /etc/fstab; then
                echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
            fi
            
            log "✅ Swap file created and activated"
        else
            warn "Failed to create swap file, continuing without it"
        fi
    fi
}

# Function to install dependencies with memory management
install_dependencies() {
    log "📦 Installing dependencies..."
    
    # Set Node.js memory options for better handling
    export NODE_OPTIONS="--max-old-space-size=2048"
    
    # Try installing with different strategies
    if ! pnpm install --frozen-lockfile --prefer-offline 2>/dev/null; then
        warn "Regular install failed, trying with reduced parallelism..."
        
        if ! pnpm install --frozen-lockfile --prefer-offline --no-optional 2>/dev/null; then
            warn "Install with no-optional failed, trying production only..."
            
            if ! NODE_ENV=production pnpm install --frozen-lockfile --prod 2>/dev/null; then
                error "All install methods failed. You may need more memory or a larger instance."
                exit 1
            fi
        fi
    fi
    
    log "✅ Dependencies installed successfully"
}

log "🚀 Starting CEMSE application deployment..."

# Check memory and setup swap if needed
setup_swap

# Pull latest changes
if [ -d .git ]; then
    log "📥 Pulling latest changes from git..."
    git pull
fi

# Ensure pnpm is installed
if ! command -v pnpm &> /dev/null; then
    log "📦 Installing pnpm..."
    sudo npm install -g pnpm
fi

# Install dependencies with memory management
install_dependencies

# Generate Prisma client
log "🔧 Generating Prisma client..."
export NODE_OPTIONS="--max-old-space-size=2048"
if ! pnpm prisma generate; then
    error "Failed to generate Prisma client"
    exit 1
fi

# Run database migrations (only if database is accessible)
log "🗄️ Running database migrations..."
if docker-compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
    pnpm prisma migrate deploy
else
    warn "Database container not running, skipping migrations"
fi

# Build application
log "🏗️ Building application..."
export NODE_OPTIONS="--max-old-space-size=2048"
if ! pnpm build; then
    error "Build failed"
    exit 1
fi

# Restart services
log "🔄 Restarting services..."
#docker-compose -f docker-compose.prod.yml down
docker-compose down
docker-compose up --build -d
#docker-compose -f docker-compose.prod.yml up -d --build

# Wait a moment for containers to start
sleep 5

# Verify deployment
log "🔍 Verifying deployment..."
#if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
if docker-compose ps | grep -q "Up"; then
    log "✅ Deployment completed successfully!"
    
    # Show running containers
    echo ""
    log "📊 Running containers:"
    #docker-compose -f docker-compose.prod.yml ps
    docker-compose ps
    
    echo ""
    log "🌐 Access your application at:"
    log "   - HTTP: http://$(curl -s ifconfig.me)"
    log "   - Local: http://localhost:3000"
    log "   - MinIO: http://$(curl -s ifconfig.me):9000"
else
    error "Deployment verification failed. Check logs:"
    #echo "   docker-compose -f docker-compose.prod.yml logs"
    echo "   docker-compose logs"
    exit 1
fi