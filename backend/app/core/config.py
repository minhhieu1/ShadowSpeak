from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


AppEnv = Literal["dev", "prod", "test"]
AuthProvider = Literal["oidc"]


def _env_file_path() -> str | None:
    """Return the .env path only if the file exists.

    This keeps the module-level ``create_app()`` from failing when
    ``.env`` is absent (CI, test environments), while still loading
    from ``.env`` when it is present (local dev).
    """
    path = Path(".env")
    return str(path) if path.exists() else None


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables (.env + OS env).

    Every field without a default is required — missing or empty values
    will raise a ``ValidationError`` at startup.
    """

    app_env: AppEnv
    app_name: str
    api_version: str
    log_level: str

    auth_provider: AuthProvider
    auth_issuer: str
    auth_jwks_url: str
    auth_audience: str
    auth_user_id_claim: str
    auth_roles_claim: str

    dynamodb_table_name: str
    dynamodb_region: str
    dynamodb_endpoint: str | None = None

    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_default_region: str

    model_config = SettingsConfigDict(
        env_file=_env_file_path(),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings(_env_file=_env_file_path())
