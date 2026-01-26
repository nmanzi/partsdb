#!/bin/bash
set -e

# Initialize database if it doesn't exist
if [ ! -f "/app/data/parts_inventory.db" ]; then
    echo "Database not found. Initializing with sample data..."
    python init_db.py
else
    echo "Database found. Using existing database."
    # Just ensure tables exist (in case of schema updates)
    python -c "from backend.database import create_tables; create_tables()"
fi

# Start the application
exec "$@"