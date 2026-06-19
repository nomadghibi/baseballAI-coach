#!/bin/sh
set -e

# Log which DB host we're connecting to (safe — no password printed)
DB_HOST=$(echo "$DATABASE_URL" | sed 's|.*@||' | sed 's|/.*||')
echo "Connecting to database host: ${DB_HOST:-NOT SET}"

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set. Check Render environment variables."
    exit 1
fi

echo "Running database migrations..."
TRIES=0
MAX=60
until alembic upgrade head; do
    TRIES=$((TRIES + 1))
    if [ "$TRIES" -ge "$MAX" ]; then
        echo "ERROR: migrations failed after $MAX attempts. Exiting."
        exit 1
    fi
    echo "Migration failed (attempt $TRIES/$MAX) — retrying in 5s..."
    sleep 5
done

echo "Migrations complete. Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
