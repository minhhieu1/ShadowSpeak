"""Structured audit logging helpers."""

import json
import logging
from typing import Any

logger = logging.getLogger("shadowspeak.audit")


def write_audit_log(entry: dict[str, Any]) -> None:
    logger.info(json.dumps(entry, sort_keys=True))
