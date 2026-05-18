"""DynamoDB client and table wrapper for ShadowSpeak.

Single-table design with PK/SK pattern:

PK                  | SK        | Entity
--------------------|-----------|-----------------------
USER#<userId>       | PROFILE   | User profile
USER#<userId>       | CONSENT   | User-scoped consent
DEVICE#<deviceId>   | CONSENT   | Device-scoped consent
"""

from functools import lru_cache

import boto3
from botocore.config import Config as BotoConfig

from app.core.config import get_settings


class DynamoDBTable:
    """Wrapper around a DynamoDB table for single-table operations."""

    def __init__(self, table_name: str, endpoint_url: str | None = None) -> None:
        session = boto3.Session()
        config = BotoConfig(
            retries={"max_attempts": 3, "mode": "adaptive"},
            connect_timeout=5,
            read_timeout=5,
        )
        kwargs: dict = {"service_name": "dynamodb", "config": config}
        if endpoint_url:
            kwargs["endpoint_url"] = endpoint_url
        self._client = session.client(**kwargs)
        self._table_name = table_name

    @property
    def table_name(self) -> str:
        return self._table_name

    @property
    def client(self):
        return self._client

    def get_item(self, pk: str, sk: str) -> dict | None:
        result = self._client.get_item(
            TableName=self._table_name,
            Key={"PK": {"S": pk}, "SK": {"S": sk}},
        )
        item = result.get("Item")
        if item is None:
            return None
        return _unmarshal(item)

    def put_item(self, item: dict, pk: str, sk: str) -> None:
        record = {**item, "PK": pk, "SK": sk}
        self._client.put_item(
            TableName=self._table_name,
            Item=_marshal(record),
        )

    def delete_item(self, pk: str, sk: str) -> None:
        self._client.delete_item(
            TableName=self._table_name,
            Key={"PK": {"S": pk}, "SK": {"S": sk}},
        )

    def update_item_attributes(
        self, pk: str, sk: str, attributes: dict
    ) -> None:
        """Update specific attributes of an item.

        Builds a SET expression from the given attributes dict.
        """
        if not attributes:
            return

        expr_parts: list[str] = []
        expr_attr_names: dict[str, str] = {}
        expr_attr_values: dict[str, dict] = {}

        for i, key in enumerate(attributes):
            expr_parts.append(f"#attr{i} = :val{i}")
            expr_attr_names[f"#attr{i}"] = key
            expr_attr_values[":val{i}"] = _marshal_value(attributes[key])

        update_expr = "SET " + ", ".join(expr_parts)

        self._client.update_item(
            TableName=self._table_name,
            Key={"PK": {"S": pk}, "SK": {"S": sk}},
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expr_attr_names,
            ExpressionAttributeValues=expr_attr_values,
        )

    def query(
        self, pk: str, sk_begins_with: str | None = None
    ) -> list[dict]:
        """Query items by partition key, optionally filtering by SK prefix."""
        kwargs: dict = {
            "TableName": self._table_name,
            "KeyConditionExpression": "PK = :pk",
            "ExpressionAttributeValues": {":pk": {"S": pk}},
        }
        if sk_begins_with:
            kwargs["KeyConditionExpression"] += " AND begins_with(SK, :sk)"
            kwargs["ExpressionAttributeValues"][":sk"] = {"S": sk_begins_with}

        items: list[dict] = []
        paginator = self._client.get_paginator("query")
        for page in paginator.paginate(**kwargs):
            for item in page.get("Items", []):
                items.append(_unmarshal(item))
        return items

    def scan(self, filter_expression: str | None = None, expr_attr_values: dict | None = None) -> list[dict]:
        """Scan the table with an optional filter expression."""
        kwargs: dict = {"TableName": self._table_name}
        if filter_expression:
            kwargs["FilterExpression"] = filter_expression
        if expr_attr_values:
            kwargs["ExpressionAttributeValues"] = expr_attr_values

        items: list[dict] = []
        paginator = self._client.get_paginator("scan")
        for page in paginator.paginate(**kwargs):
            for item in page.get("Items", []):
                items.append(_unmarshal(item))
        return items

    def batch_delete(self, keys: list[tuple[str, str]]) -> None:
        """Batch delete items by (PK, SK) pairs."""
        if not keys:
            return
        for i in range(0, len(keys), 25):
            batch = keys[i : i + 25]
            self._client.batch_write_item(
                RequestItems={
                    self._table_name: [
                        {
                            "DeleteRequest": {
                                "Key": {"PK": {"S": pk}, "SK": {"S": sk}}
                            }
                        }
                        for pk, sk in batch
                    ]
                }
            )

    def ensure_table_exists(self) -> None:
        """Create the table if it doesn't exist (for local dev)."""
        existing_tables = self._client.list_tables()["TableNames"]
        if self._table_name in existing_tables:
            return

        self._client.create_table(
            TableName=self._table_name,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        self._client.get_waiter("table_exists").wait(TableName=self._table_name)


@lru_cache
def get_table() -> DynamoDBTable:
    """Get the singleton DynamoDBTable instance."""
    settings = get_settings()
    endpoint = None
    if settings.dynamodb_endpoint:
        endpoint = settings.dynamodb_endpoint
    elif settings.app_env == "local":
        endpoint = "http://localhost:8000"
    return DynamoDBTable(
        table_name=settings.dynamodb_table_name,
        endpoint_url=endpoint,
    )


def reset_table_cache() -> None:
    """Reset the cached table instance (for testing)."""
    get_table.cache_clear()


# --- DynamoDB marshalling helpers ---


def _marshal(item: dict) -> dict:
    """Convert a Python dict to DynamoDB JSON format."""
    result = {}
    for key, value in item.items():
        result[key] = _marshal_value(value)
    return result


def _marshal_value(value) -> dict:
    if isinstance(value, str):
        return {"S": value}
    if isinstance(value, bool):
        return {"BOOL": value}
    if isinstance(value, int):
        return {"N": str(value)}
    if isinstance(value, float):
        return {"N": str(value)}
    if value is None:
        return {"NULL": True}
    if isinstance(value, dict):
        return {"M": {k: _marshal_value(v) for k, v in value.items()}}
    if isinstance(value, list):
        return {"L": [_marshal_value(v) for v in value]}
    return {"S": str(value)}


def _unmarshal(item: dict) -> dict:
    """Convert DynamoDB JSON format to a Python dict."""
    result = {}
    for key, dyn_value in item.items():
        if key in ("PK", "SK"):
            continue
        result[key] = _unmarshal_value(dyn_value)
    return result


def _unmarshal_value(dyn_value: dict):
    if "S" in dyn_value:
        return dyn_value["S"]
    if "BOOL" in dyn_value:
        return dyn_value["BOOL"]
    if "N" in dyn_value:
        raw = dyn_value["N"]
        return int(raw) if "." not in raw else float(raw)
    if "NULL" in dyn_value:
        return None
    if "M" in dyn_value:
        return {k: _unmarshal_value(v) for k, v in dyn_value["M"].items()}
    if "L" in dyn_value:
        return [_unmarshal_value(v) for v in dyn_value["L"]]
    return None
