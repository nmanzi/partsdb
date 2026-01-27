#!/bin/bash
set -e

# Ensure data directory exists
mkdir -p /app/data

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

echo "Database setup complete."

# Start the application
exec "$@"