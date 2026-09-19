from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    entra_tenant_id: str = Field("common", alias="ENTRA_TENANT_ID")
    entra_client_id: str = Field("", alias="ENTRA_CLIENT_ID")
    entra_client_secret: str = Field("", alias="ENTRA_CLIENT_SECRET")
    entra_redirect_uri: str = Field("http://localhost:8000/auth/callback", alias="ENTRA_REDIRECT_URI")
    frontend_origin: str = Field("http://localhost:5173", alias="FRONTEND_ORIGIN")
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")
    session_ttl_seconds: int = Field(43200, alias="SESSION_TTL_SECONDS")
    oidc_state_ttl_seconds: int = Field(300, alias="OIDC_STATE_TTL_SECONDS")
    session_cookie_name: str = Field("infrabase_session", alias="SESSION_COOKIE_NAME")
    cookie_secure: bool = Field(True, alias="COOKIE_SECURE")
    allowed_origins: list[str] = Field(default_factory=list, alias="ALLOWED_ORIGINS")

    @property
    def issuer(self) -> str:
        return f"https://login.microsoftonline.com/{self.entra_tenant_id}/v2.0"

    @property
    def discovery_url(self) -> str:
        return f"{self.issuer}/.well-known/openid-configuration"


@lru_cache
def get_settings() -> Settings:
    return Settings()
