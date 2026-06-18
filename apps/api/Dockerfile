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

RUN mkdir -p storage/uploads && chmod +x start.sh

EXPOSE 10000

CMD ["./start.sh"]
