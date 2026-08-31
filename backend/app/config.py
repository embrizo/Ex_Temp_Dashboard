from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/sensor_dashboard"
    allowed_origins: str = "http://localhost:5173"
    app_env: str = "development"
    anthropic_api_key: str | None = None
    assistant_model: str = "claude-sonnet-5"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
