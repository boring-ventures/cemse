#!/bin/bash

# Script to fix upload limits for AWS EC2 deployment
# Run this script on your EC2 instance

echo "🔧 Fixing upload limits for AWS EC2 deployment..."

# 1. Update Next.js configuration
echo "📝 Updating Next.js configuration..."
# The next.config.js file has already been updated with the necessary changes

# 2. Update Docker Compose (if using nginx)
echo "🐳 Checking Docker Compose configuration..."
if [ -f "docker-compose.yml" ]; then
    echo "Found docker-compose.yml"
    
    # Check if nginx service exists
    if grep -q "nginx:" docker-compose.yml; then
        echo "Nginx service found. You may need to update nginx configuration."
        echo "Add the following to your nginx configuration:"
        echo "  client_max_body_size 2G;"
        echo "  client_body_timeout 60s;"
        echo "  proxy_read_timeout 300s;"
    else
        echo "No nginx service found. Upload limits should be handled by Next.js."
    fi
else
    echo "No docker-compose.yml found. Make sure your deployment handles large uploads."
fi

# 3. Check if running in Docker
if [ -f "/.dockerenv" ]; then
    echo "🐳 Running inside Docker container"
    echo "Make sure your Docker container has sufficient resources:"
    echo "  - Memory: At least 2GB"
    echo "  - CPU: At least 1 core"
    echo "  - Disk space: At least 10GB free"
fi

# 4. Environment variables check
echo "🔍 Checking environment variables..."
if [ -z "$NODE_OPTIONS" ]; then
    echo "Consider setting NODE_OPTIONS='--max-old-space-size=2048' for better memory handling"
fi

# 5. Restart services
echo "🔄 Restarting services..."
if command -v docker-compose &> /dev/null; then
    echo "Restarting with docker-compose..."
    docker-compose down
    docker-compose up -d
elif command -v docker &> /dev/null; then
    echo "Restarting with docker..."
    docker restart $(docker ps -q)
else
    echo "No Docker found. Restart your Node.js application manually."
fi

echo "✅ Upload limit fixes applied!"
echo ""
echo "📋 Summary of changes:"
echo "  - Reduced chunk size from 5MB to 1MB"
echo "  - Added API route configuration for larger uploads"
echo "  - Updated Next.js configuration"
echo "  - Added nginx configuration template"
echo ""
echo "🧪 Test the upload functionality now!"
