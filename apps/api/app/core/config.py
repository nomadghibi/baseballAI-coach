import json
from pydantic import model_validator
from pydantic_settings import BaseSettings
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    app_name: str = "BaseballAI Coach API"
    version: str = "0.1.0"
    debug: bool = False

    # Full URL (optional — overridden if DB_* parts are set)
    database_url: str = ""

    # Individual DB parts — use these when password has special chars
    db_host: str = ""
    db_port: int = 5432
    db_name: str = "postgres"
    db_user: str = "postgres"
    db_password: str = ""

    @model_validator(mode="after")
    def resolve_database_url(self) -> "Settings":
        if self.db_host and self.db_password:
            # Strip port if user accidentally included it in DB_HOST
            host = self.db_host.split(":")[0]
            self.database_url = str(URL.create(
                drivername="postgresql",
                username=self.db_user,
                password=self.db_password,
                host=host,
                port=self.db_port,
                database=self.db_name,
            ))
        elif self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql://", 1)
        elif not self.database_url:
            # Local dev fallback
            self.database_url = "postgresql://baseballai:baseballai_dev@localhost:5432/baseballai"
        return self

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
