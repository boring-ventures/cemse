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
    
    # Additional checks
    log "🔍 Checking Docker containers..."
    docker-compose -f docker-compose.prod.yml ps
    
    log "🔍 Checking recent logs..."
    docker-compose -f docker-compose.prod.yml logs --tail=20
    
    exit 1
fi