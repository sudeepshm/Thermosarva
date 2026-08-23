"""
app/core/config.py — Thermosarva application settings.

All secrets are read from environment variables via .env.
Never hardcode secrets; never expose them to the frontend.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ───────────────────────────────────────────────────────────
    app_name: str = "Thermosarva API"
    app_version: str = "0.1.0"
    environment: str = "development"
    secret_key: str = "change_this_in_production"

    # ── CORS ──────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    # ── FortyGuard ────────────────────────────────────────────────────────────
    fortyguard_api_key: str = ""
    fortyguard_base_url: str = "https://api.fortyguard.com/v1"
    fortyguard_stub_mode: bool = True          # True = use stubs (no real key)
    fortyguard_timeout_seconds: float = 30.0
    fortyguard_poll_interval_seconds: float = 2.0
    fortyguard_max_poll_attempts: int = 15

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./thermosarva.db"

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    redis_fallback_memory: bool = True         # True = in-memory dict if Redis down

    # ── Geographic Services ───────────────────────────────────────────────────
    nominatim_base_url: str = "https://nominatim.openstreetmap.org"
    nominatim_user_agent: str = "thermosarva/1.0"
    overpass_base_url: str = "https://overpass-api.de/api"

    # ── Weather ───────────────────────────────────────────────────────────────
    nws_base_url: str = "https://api.weather.gov"

    # ── OpenAQ ────────────────────────────────────────────────────────────────
    openaq_api_key: str = ""
    openaq_base_url: str = "https://api.openaq.org/v3"

    # ── Cache TTLs (seconds) ──────────────────────────────────────────────────
    cache_ttl_heatmap: int = 1800          # 30 min
    cache_ttl_environment: int = 900       # 15 min
    cache_ttl_pois: int = 21600           # 6 hours
    cache_ttl_nws_alerts: int = 600        # 10 min
    cache_ttl_solar: int = 1800           # 30 min

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def fortyguard_enabled(self) -> bool:
        """FortyGuard is active only when key is set and stub mode is off."""
        return bool(self.fortyguard_api_key) and not self.fortyguard_stub_mode


@lru_cache
def get_settings() -> Settings:
    return Settings()
