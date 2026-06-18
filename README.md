# BaseballAI Coach

Private youth baseball pitching analysis. Parent uploads video → pose analysis → mechanics report → session history.

## Repo structure

```
apps/
  web/     Next.js 15 frontend (TypeScript, Tailwind)
  api/     FastAPI backend (Python 3.12)
docs/      project documentation
infra/     docker, deployment config
storage/   local dev sample videos only
```

## Prerequisites

- Node.js 20+
- Python 3.12+
- Docker Desktop (for local Postgres)

---

## Local development

### 1. Start Postgres

```sh
docker compose up -d
```

Postgres runs on `localhost:5432`, database `baseballai`, user `baseballai`, password `baseballai_dev`.

---

### 2. Run the API

```sh
cd apps/api

# Create venv
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source .venv/bin/activate

# Install deps
pip install -r requirements-dev.txt

# Copy env
cp .env.example .env

# Start
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health

API docs (debug mode): http://localhost:8000/docs

---

### 3. Run the web app

```sh
cd apps/web

npm install

# Copy env
cp .env.local.example .env.local

npm run dev
```

App: http://localhost:3000

Web health: http://localhost:3000/api/health

---

## Phase 0 done when

- [x] `apps/api` runs, `/health` returns `{"status":"ok"}`
- [x] `apps/web` runs, `/api/health` returns `{"status":"ok"}`
- [x] Docker Compose starts Postgres

## Build phases

| Phase | Goal |
|-------|------|
| 0 | Repo scaffold + health checks |
| 1 | Auth + athlete profiles |
| 2 | Session + video upload |
| 3 | CV pipeline CLI |
| 4 | Analysis job integration |
| 5 | Analysis dashboard |
| 6 | Progress tracking |
| 7 | Privacy hardening |
