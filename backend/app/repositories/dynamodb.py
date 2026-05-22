"""Base DynamoDB client initialisation.

Provides a single factory function that returns a ``dynamodb.Table``
resource configured from ``Settings``.
"""

import boto3

from app.core.config import Settings


def get_table(settings: Settings):
    """Return a ``dynamodb.Table`` instance for the configured table."""
    session_kwargs = {"region_name": settings.aws_default_region}
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        session_kwargs["aws_access_key_id"] = settings.aws_access_key_id
        session_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

    session = boto3.Session(**session_kwargs)
    resource_kwargs = {"region_name": settings.dynamodb_region}
    if settings.dynamodb_endpoint:
        resource_kwargs["endpoint_url"] = settings.dynamodb_endpoint
    resource = session.resource("dynamodb", **resource_kwargs)
    return resource.Table(settings.dynamodb_table_name)
