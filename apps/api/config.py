import os
from dataclasses import dataclass

DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://localhost:3001"


@dataclass(frozen=True)
class Settings:
	cors_origins: list[str]
	log_level: str
	app_version: str
	api_token: str | None


def load_settings() -> Settings:
	origins = os.environ.get("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
	return Settings(
		cors_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
		log_level=os.environ.get("LOG_LEVEL", "INFO").upper(),
		app_version=os.environ.get("APP_VERSION", "dev"),
		api_token=os.environ.get("API_TOKEN") or None,
	)