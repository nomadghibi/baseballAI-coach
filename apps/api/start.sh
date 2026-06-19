#!/bin/sh
set -e

# Log which DB host we're connecting to (safe — no password printed)
if [ -n "$DB_HOST" ]; then
    echo "Connecting to database host: $DB_HOST"
elif [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed 's|.*@||' | sed 's|[:/].*||')
    echo "Connecting to database host: $DB_HOST"
else
    echo "ERROR: Neither DB_HOST nor DATABASE_URL is set."
    exit 1
fi

echo "Running database migrations..."
TRIES=0
MAX=5
until alembic upgrade head 2>&1; do
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
