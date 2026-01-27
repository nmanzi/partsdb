#!/bin/bash
set -e

# Ensure data directory exists
mkdir -p /app/data

# Run database migrations
echo "Setting up database..."
if [ ! -f "/app/data/parts_inventory.db" ]; then
    echo "Database not found. Creating empty database with current schema..."
    alembic upgrade head
else
    echo "Database found. Running migrations..."
    alembic upgrade head
fi

echo "Database setup complete."

# Start the application
exec "$@"