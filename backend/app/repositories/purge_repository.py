"""Persistence helpers for account purge operations."""

from __future__ import annotations

from typing import Any

import boto3


class PurgeRepository:
    def __init__(self, table: Any):
        self.table = table

    def delete_consent(self, user_id: str) -> None:
        self.table.delete_item(Key={"pk": f"USER#{user_id}", "sk": "CONSENT"})

    def delete_items_with_sk_prefixes(self, user_id: str, prefixes: list[str]) -> None:
        response = self.table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("pk").eq(f"USER#{user_id}")
        )
        for item in response.get("Items", []):
            sk = item.get("sk", "")
            if any(sk.startswith(prefix) for prefix in prefixes):
                self.table.delete_item(Key={"pk": item["pk"], "sk": item["sk"]})

    def delete_session_items(self, user_id: str) -> None:
        response = self.table.scan(
            FilterExpression=(
                boto3.dynamodb.conditions.Attr("gsi1pk").eq(f"USER#{user_id}")
                & boto3.dynamodb.conditions.Attr("gsi1sk").begins_with("SESSION#")
            )
        )
        for item in response.get("Items", []):
            self.table.delete_item(Key={"pk": item["pk"], "sk": item["sk"]})
