from functools import lru_cache
import json
from pathlib import Path
from typing import Literal

from pydantic import field_validator, model_validator
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
    auth_jwt_leeway: int = 30
    auth_required_claims: str | None = None

    rate_limit_enabled: bool = True
    rate_limit_window_seconds: int = 60
    rate_limit_authenticated_writes: int = 30
    rate_limit_preauth_writes: int = 10

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

    @field_validator("auth_required_claims")
    @classmethod
    def validate_required_claims(cls, value: str | None) -> str | None:
        if value is None:
            return None
        parsed = json.loads(value)
        if not isinstance(parsed, dict):
            raise ValueError("auth_required_claims must be a JSON object")
        return value

    def get_auth_required_claims(self) -> dict[str, str]:
        if not self.auth_required_claims:
            return {}
        parsed = json.loads(self.auth_required_claims)
        return {
            str(key): str(value)
            for key, value in parsed.items()
        }

    @model_validator(mode="after")
    def validate_aws_credential_policy(self) -> "Settings":
        has_static_key = bool(self.aws_access_key_id or self.aws_secret_access_key)
        if self.app_env == "prod" and has_static_key:
            raise ValueError(
                "Static AWS credentials are not allowed in prod; use the default AWS credential chain"
            )
        if bool(self.aws_access_key_id) != bool(self.aws_secret_access_key):
            raise ValueError(
                "aws_access_key_id and aws_secret_access_key must be provided together"
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings(_env_file=_env_file_path())
