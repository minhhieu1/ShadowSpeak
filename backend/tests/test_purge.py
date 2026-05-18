"""Tests for async purge service."""

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

import pytest

from app.models.auth import UserProfile


class TestPurgeService:
    def test_find_expired_deletions_returns_eligible_profiles(self) -> None:
        from app.services.purge_service import PurgeService

        now = datetime.now(UTC)
        past = (now - timedelta(days=31)).isoformat()

        mock_repo = MagicMock()
        mock_repo.find_profiles_with_deletion_requested.return_value = [
            UserProfile(
                userId="user-1",
                deletionRequestedAt=past,
                deletionStatus="deletion_requested",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt=past,
            ),
            UserProfile(
                userId="user-2",
                deletionRequestedAt=(now - timedelta(days=35)).isoformat(),
                deletionStatus="deletion_requested",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt=past,
            ),
        ]

        service = PurgeService(mock_repo)
        result = service.find_expired_deletions()

        assert len(result) == 2
        assert result[0].userId == "user-1"

    def test_find_expired_deletions_excludes_recent_requests(self) -> None:
        from app.services.purge_service import PurgeService

        now = datetime.now(UTC)
        recent = (now - timedelta(days=1)).isoformat()

        mock_repo = MagicMock()
        mock_repo.find_profiles_with_deletion_requested.return_value = [
            UserProfile(
                userId="user-recent",
                deletionRequestedAt=recent,
                deletionStatus="deletion_requested",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt=recent,
            ),
        ]

        service = PurgeService(mock_repo)
        result = service.find_expired_deletions()

        # Recent requests should not be returned
        assert len(result) == 0

    def test_purge_account_calls_repo_purge(self) -> None:
        from app.services.purge_service import PurgeService

        mock_repo = MagicMock()

        service = PurgeService(mock_repo)
        service.purge_account("user-123")

        mock_repo.purge_user_data.assert_called_once_with("user-123")

    def test_complete_purge_marks_as_purged(self) -> None:
        from app.services.purge_service import PurgeService

        mock_repo = MagicMock()

        service = PurgeService(mock_repo)
        service.complete_purge("user-123")

        mock_repo.mark_as_purged.assert_called_once_with("user-123")
