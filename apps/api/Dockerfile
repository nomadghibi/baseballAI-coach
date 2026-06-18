FROM python:3.12-slim

WORKDIR /app

# libpq-dev for psycopg2, gcc for any C extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p storage/uploads

EXPOSE 10000

CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
