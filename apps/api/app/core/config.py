import json
import os

from pydantic_settings import BaseSettings
from sqlalchemy.engine import URL


def build_db_url() -> URL:
    """Build SQLAlchemy URL from DB_* env vars. Never interpolates password into strings."""
    host = os.environ.get("DB_HOST", "").split(":")[0]
    user = os.environ.get("DB_USER", "")
    password = os.environ.get("DB_PASSWORD", "")
    port = int(os.environ.get("DB_PORT", "5432"))
    name = os.environ.get("DB_NAME", "postgres")

    is_local = host in ("", "localhost", "127.0.0.1")

    return URL.create(
        drivername="postgresql+psycopg2",
        username=user or "baseballai",
        password=password or "baseballai_dev",
        host=host or "localhost",
        port=port,
        database=name,
        query={"sslmode": "require"} if not is_local else {},
    )


class Settings(BaseSettings):
    app_name: str = "BaseballAI Coach API"
    version: str = "0.1.0"
    debug: bool = False

    cors_origins: list[str] = ["http://localhost:3000"]

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    storage_provider: str = "local"
    storage_local_dir: str = "storage/uploads"
    storage_base_url: str = "http://localhost:8000"
    storage_bucket: str = ""
    storage_endpoint: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""

    max_video_size_bytes: int = 500 * 1024 * 1024
    allowed_video_types: list[str] = ["video/mp4", "video/quicktime", "video/x-m4v"]

    resend_api_key: str = ""
    resend_from_email: str = "BaseballAI Coach <onboarding@resend.dev>"
    app_base_url: str = "https://baseballai-coach.vercel.app"

    model_config = {"env_file": ".env", "case_sensitive": False}

    def cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_origins, str):
            return json.loads(self.cors_origins)
        return self.cors_origins


settings = Settings()
