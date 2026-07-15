#!/bin/bash
# SGI MongoDB Backup Script
# Usage: ./backup.sh [daily|weekly|monthly|restore]
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASS="${MONGO_PASS:-admin}"
MONGO_DB="${MONGO_DB:-sgi_db}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

backup_full() {
    echo "[$(date)] Starting full backup of $MONGO_DB..."
   mongodump \
        --host="$MONGO_HOST:$MONGO_PORT" \
        --username="$MONGO_USER" \
        --password="$MONGO_PASS" \
        --authenticationDatabase=admin \
        --db="$MONGO_DB" \
        --archive="$BACKUP_DIR/sgi_full_${DATE}.archive" \
        --gzip

    echo "[$(date)] Backup completed: sgi_full_${DATE}.archive"
    echo "[$(date)] Size: $(du -sh "$BACKUP_DIR/sgi_full_${DATE}.archive" | cut -f1)"
}

backup_collections() {
    echo "[$(date)] Starting collection-level backup..."
    COLLECTIONS=(
        "users" "organizations" "processes" "assets" "documents"
        "risks" "controls" "incidents" "audits" "courses"
        "enrollments" "roles" "raci_matrices" "org_positions"
        "widget_layouts" "ai_chat_sessions" "ai_suggestions"
    )

    for col in "${COLLECTIONS[@]}"; do
        echo "  Backing up $col..."
        mongodump \
            --host="$MONGO_HOST:$MONGO_PORT" \
            --username="$MONGO_USER" \
            --password="$MONGO_PASS" \
            --authenticationDatabase=admin \
            --db="$MONGO_DB" \
            --collection="$col" \
            --out="$BACKUP_DIR/$DATE" \
            --gzip
    done
    echo "[$(date)] Collection backup completed in $BACKUP_DIR/$DATE/"
}

cleanup_old() {
    echo "[$(date)] Cleaning backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "sgi_full_*" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
    echo "[$(date)] Cleanup completed"
}

restore() {
    local BACKUP_FILE="${1:-}"
    if [ -z "$BACKUP_FILE" ]; then
        echo "Usage: $0 restore <backup_file>"
        echo "Available backups:"
        ls -lh "$BACKUP_DIR"/sgi_full_*.archive 2>/dev/null || echo "  No backups found"
        exit 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    echo "[$(date)] Restoring from $BACKUP_FILE..."
    mongorestore \
        --host="$MONGO_HOST:$MONGO_PORT" \
        --username="$MONGO_USER" \
        --password="$MONGO_PASS" \
        --authenticationDatabase=admin \
        --db="$MONGO_DB" \
        --archive="$BACKUP_FILE" \
        --gzip \
        --drop

    echo "[$(date)] Restore completed"
}

case "${1:-daily}" in
    daily)
        backup_full
        cleanup_old
        ;;
    weekly)
        backup_full
        backup_collections
        cleanup_old
        ;;
    monthly)
        backup_full
        backup_collections
        cleanup_old
        ;;
    restore)
        restore "${2:-}"
        ;;
    cleanup)
        cleanup_old
        ;;
    *)
        echo "Usage: $0 [daily|weekly|monthly|restore <file>|cleanup]"
        exit 1
        ;;
esac
