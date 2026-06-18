import json
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "BaseballAI Coach API"
    version: str = "0.1.0"
    debug: bool = False

    database_url: str = "postgresql://baseballai:baseballai_dev@localhost:5432/baseballai"

    cors_origins: list[str] = ["http://localhost:3000"]

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    storage_provider: str = "local"
    storage_local_dir: str = "storage/uploads"
    storage_base_url: str = "http://localhost:8000"
    storage_bucket: str = ""
    storage_endpoint: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""

    max_video_size_bytes: int = 500 * 1024 * 1024  # 500 MB
    allowed_video_types: list[str] = ["video/mp4", "video/quicktime", "video/x-m4v"]

    model_config = {"env_file": ".env", "case_sensitive": False}

    def cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_origins, str):
            return json.loads(self.cors_origins)
        return self.cors_origins


settings = Settings()
