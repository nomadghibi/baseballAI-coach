#!/bin/sh
set -e

echo "Running database migrations..."
TRIES=0
MAX=30
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
