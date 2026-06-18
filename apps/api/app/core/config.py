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

    storage_bucket: str = ""
    storage_endpoint: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""

    model_config = {"env_file": ".env", "case_sensitive": False}

    def cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_origins, str):
            return json.loads(self.cors_origins)
        return self.cors_origins


settings = Settings()
