from fastapi import FastAPI

from app.core.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.app_env}

    @app.get("/config/runtime")
    def runtime_config() -> dict[str, str | None]:
        return {
            "appEnv": settings.app_env,
            "authProvider": settings.auth_provider,
            "authIssuer": settings.auth_issuer,
            "authAudience": settings.auth_audience,
            "dynamodbTableName": settings.dynamodb_table_name,
            "dynamodbRegion": settings.dynamodb_region,
            "dynamodbEndpoint": settings.dynamodb_endpoint,
        }

    return app


app = create_app()
