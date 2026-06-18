import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.auth.routes import router as auth_router
from app.athletes.routes import router as athletes_router
from app.core.config import settings
from app.analysis.routes import router as analysis_router
from app.sessions.routes import router as sessions_router
from app.videos.routes import router as videos_router

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(athletes_router, prefix=API_PREFIX)
app.include_router(sessions_router, prefix=API_PREFIX)
app.include_router(videos_router, prefix=API_PREFIX)
app.include_router(analysis_router, prefix=API_PREFIX)

# Local dev: serve uploaded files as static. Not used in production.
if settings.storage_provider == "local":
    os.makedirs(settings.storage_local_dir, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=settings.storage_local_dir), name="storage")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "baseballai-api", "version": settings.version}
