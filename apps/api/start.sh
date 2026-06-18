#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until alembic upgrade head; do
    echo "Migration failed — database not ready yet, retrying in 5s..."
    sleep 5
done

echo "Migrations complete. Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
