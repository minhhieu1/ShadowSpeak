from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    app_name: str = "ShadowSpeak API"
    api_version: str = "v1"
    allow_dev_auth: bool = True

    # Cognito settings
    cognito_user_pool_id: str = ""
    cognito_region: str = "us-east-1"
    cognito_client_id: str = ""
    cognito_jwks_url: str = ""

    # DynamoDB settings
    dynamodb_table_name: str = "shadowspeak-local"
    dynamodb_region: str = "us-east-1"
    dynamodb_endpoint: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
