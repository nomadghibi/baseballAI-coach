import logging
import os

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.analysis.routes import router as analysis_router
from app.auth.routes import router as auth_router
from app.athletes.routes import router as athletes_router
from app.core.config import settings
from app.core.exceptions import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.notes.routes import router as notes_router
from app.sessions.routes import router as sessions_router
from app.videos.routes import router as videos_router

logger = logging.getLogger(__name__)

# Warn loudly if default secret key is still in use
if settings.secret_key == "change-me-in-production":
    logger.warning(
        "SECRET_KEY is set to the default value — set a strong random key in production."
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if not settings.debug:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Exception handlers — must be registered before middleware
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.add_middleware(SecurityHeadersMiddleware)
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
app.include_router(notes_router, prefix=API_PREFIX)

# Local dev: serve uploaded files as static. Not used in production.
if settings.storage_provider == "local":
    os.makedirs(settings.storage_local_dir, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=settings.storage_local_dir), name="storage")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "baseballai-api", "version": settings.version}
