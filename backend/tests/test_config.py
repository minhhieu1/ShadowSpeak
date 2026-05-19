from app.core.config import Settings, get_settings
from app.main import create_app


def test_dev_settings_load_keycloak_and_local_dynamodb() -> None:
    settings = Settings(
        _env_file=None,
        app_env="dev",
        app_name="ShadowSpeak API",
        api_version="v1",
        log_level="DEBUG",
        auth_provider="oidc",
        auth_issuer="http://localhost:8080/realms/shadowspeak",
        auth_jwks_url="http://localhost:8080/realms/shadowspeak/protocol/openid-connect/certs",
        auth_audience="shadowspeak-api",
        auth_user_id_claim="sub",
        auth_roles_claim="realm_access.roles",
        dynamodb_table_name="shadowspeak-dev",
        dynamodb_region="us-east-1",
        dynamodb_endpoint="http://localhost:8000",
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy",
        aws_default_region="us-east-1",
    )

    assert settings.app_env == "dev"
    assert settings.auth_roles_claim == "realm_access.roles"


def test_prod_settings_use_cognito_groups_claim() -> None:
    settings = Settings(
        _env_file=None,
        app_env="prod",
        app_name="ShadowSpeak API",
        api_version="v1",
        log_level="INFO",
        auth_provider="oidc",
        auth_issuer="https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xxxxx",
        auth_jwks_url=(
            "https://cognito-idp.ap-southeast-1.amazonaws.com/"
            "ap-southeast-1_xxxxx/.well-known/jwks.json"
        ),
        auth_audience="prod-client-id",
        auth_user_id_claim="sub",
        auth_roles_claim="cognito:groups",
        dynamodb_table_name="shadowspeak-prod",
        dynamodb_region="ap-southeast-1",
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy",
        aws_default_region="ap-southeast-1",
    )

    assert settings.app_env == "prod"
    assert settings.auth_roles_claim == "cognito:groups"
    assert settings.dynamodb_endpoint is None


def test_app_exposes_runtime_config() -> None:
    settings = Settings(
        _env_file=None,
        app_env="dev",
        app_name="ShadowSpeak API",
        api_version="v1",
        log_level="DEBUG",
        auth_provider="oidc",
        auth_issuer="http://localhost:8080/realms/shadowspeak",
        auth_jwks_url="http://localhost:8080/realms/shadowspeak/protocol/openid-connect/certs",
        auth_audience="shadowspeak-api",
        auth_user_id_claim="sub",
        auth_roles_claim="realm_access.roles",
        dynamodb_table_name="shadowspeak-dev",
        dynamodb_region="us-east-1",
        dynamodb_endpoint="http://localhost:8000",
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy",
        aws_default_region="us-east-1",
    )

    app = create_app(settings)
    routes = {route.path for route in app.routes}

    assert "/health" in routes
    assert "/config/runtime" in routes


def test_load_settings_from_env_overrides(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "dev")
    monkeypatch.setenv("APP_NAME", "ShadowSpeak API")
    monkeypatch.setenv("API_VERSION", "v1")
    monkeypatch.setenv("LOG_LEVEL", "WARNING")
    monkeypatch.setenv("AUTH_PROVIDER", "oidc")
    monkeypatch.setenv("AUTH_ISSUER", "http://localhost:8080/realms/shadowspeak")
    monkeypatch.setenv(
        "AUTH_JWKS_URL",
        "http://localhost:8080/realms/shadowspeak/protocol/openid-connect/certs",
    )
    monkeypatch.setenv("AUTH_AUDIENCE", "shadowspeak-api")
    monkeypatch.setenv("AUTH_USER_ID_CLAIM", "sub")
    monkeypatch.setenv("AUTH_ROLES_CLAIM", "realm_access.roles")
    monkeypatch.setenv("DYNAMODB_TABLE_NAME", "override-table")
    monkeypatch.setenv("DYNAMODB_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "dummy")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "dummy")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")

    get_settings.cache_clear()
    settings = get_settings()

    assert settings.app_env == "dev"
    assert settings.log_level == "WARNING"
    assert settings.auth_issuer == "http://localhost:8080/realms/shadowspeak"
    assert settings.dynamodb_table_name == "override-table"
    assert settings.aws_default_region == "us-east-1"
