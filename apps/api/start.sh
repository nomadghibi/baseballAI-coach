#!/bin/sh
set -e

echo "=== DB connection config ==="
echo "DB_HOST=$DB_HOST"
echo "DB_USER=$DB_USER"
echo "DB_PORT=${DB_PORT:-5432}"
echo "DB_NAME=${DB_NAME:-postgres}"
echo "DB_PASSWORD_SET=${DB_PASSWORD:+yes}"

if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    echo "ERROR: DB_HOST and DB_PASSWORD must be set."
    exit 1
fi

echo ""
echo "=== Testing raw psycopg2 connection ==="
python3 - <<'PYEOF'
import os, sys
try:
    import psycopg2
    conn = psycopg2.connect(
        host=os.environ["DB_HOST"].split(":")[0],
        port=int(os.environ.get("DB_PORT", "5432")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        dbname=os.environ.get("DB_NAME", "postgres"),
        sslmode="require",
        connect_timeout=10,
    )
    conn.close()
    print("psycopg2 direct connect: OK")
except Exception as e:
    print(f"psycopg2 direct connect FAILED: {e}")
    sys.exit(1)
PYEOF

echo ""
echo "=== Running database migrations ==="
TRIES=0
MAX=5
until alembic upgrade head 2>&1; do
    TRIES=$((TRIES + 1))
    if [ "$TRIES" -ge "$MAX" ]; then
        echo "ERROR: migrations failed after $MAX attempts."
        exit 1
    fi
    echo "Migration failed (attempt $TRIES/$MAX) — retrying in 5s..."
    sleep 5
done

echo "Migrations complete. Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
