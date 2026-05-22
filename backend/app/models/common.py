"""Shared type aliases and common type definitions."""

from typing import TypedDict

Id = str
UserId = str
LessonId = str
SessionId = str
IsoDateTime = str


class JwtClaims(TypedDict, total=False):
    sub: str
    email: str
    groups: list[str]
    exp: int
    iat: int
