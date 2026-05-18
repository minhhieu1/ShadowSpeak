"""Shared test fixtures and configuration."""

import os

import pytest

from app.core.config import get_settings


@pytest.fixture(autouse=True)
def _reset_test_state() -> None:
    """Reset cached state before each test to prevent test pollution."""
    from app.core.auth import reset_jwks_cache

    get_settings.cache_clear()
    reset_jwks_cache()


@pytest.fixture(autouse=True, scope="function")
def _dynamodb_fixture():
    """Mock DynamoDB with moto for every test that needs a repository."""
    from moto import mock_aws

    from app.db.dynamodb import get_table, reset_table_cache

    reset_table_cache()

    settings = get_settings()
    settings.dynamodb_table_name = "shadowspeak-test"
    settings.dynamodb_endpoint = None

    mock = mock_aws()
    mock.start()
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

    # Create the table
    table = get_table()
    table.ensure_table_exists()

    yield

    mock.stop()
