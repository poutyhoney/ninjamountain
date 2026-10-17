from config import load_settings


def test_defaults(monkeypatch):
	monkeypatch.delenv("CORS_ORIGINS", raising=False)
	monkeypatch.delenv("LOG_LEVEL", raising=False)
	monkeypatch.delenv("APP_VERSION", raising=False)
	monkeypatch.delenv("API_TOKEN", raising=False)

	settings = load_settings()

	assert settings.cors_origins == ["http://localhost:3000", "http://localhost:3001"]
	assert settings.log_level == "INFO"
	assert settings.app_version == "dev"
	assert settings.api_token is None


def test_values_from_environment(monkeypatch):
	monkeypatch.setenv("CORS_ORIGINS", "https://a.example, https://b.example ,")
	monkeypatch.setenv("LOG_LEVEL", "debug")
	monkeypatch.setenv("APP_VERSION", "abc123")

	settings = load_settings()

	assert settings.cors_origins == ["https://a.example", "https://b.example"]
	assert settings.log_level == "DEBUG"
	assert settings.app_version == "abc123"