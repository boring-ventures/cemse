#!/bin/bash
set -e

BACKUP_DIR="./backups"
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
cp .env $BACKUP_DIR/env_backup_$DATE 2>/dev/null || log "No .env file found to backup"

# Clean old backups (keep last 7 days)
log "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "env_backup_*" -mtime +7 -delete 2>/dev/null || true

log "✅ Backup completed successfully!"