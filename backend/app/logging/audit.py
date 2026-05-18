"""Audit logging for consent and account lifecycle events.

In MVP, writes structured JSON logs that go to CloudWatch Logs
in production. Uses Python's logging module with JSON formatting.
"""

import json
import logging
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel

logger = logging.getLogger("shadowspeak.audit")


class ConsentAuditLog(BaseModel):
    eventType: str
    userId: str | None = None
    deviceId: str | None = None
    ageVerified: bool | None = None
    privacyAccepted: bool | None = None
    adConsent: str | None = None
    locale: str | None = None
    timestamp: str
    requestId: str | None = None


def write_audit_log(entry: ConsentAuditLog | dict[str, Any]) -> None:
    """Write a structured audit log entry.

    In production, this writes to CloudWatch Logs via structured JSON.
    In local dev, it uses Python's logging module.
    """
    if isinstance(entry, BaseModel):
        log_data = entry.model_dump()
    else:
        log_data = entry

    logger.info("AUDIT: %s", json.dumps(log_data, default=str))
