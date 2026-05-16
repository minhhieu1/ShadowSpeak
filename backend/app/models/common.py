from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PagedResult(BaseModel, Generic[T]):
    items: list[T]
    nextCursor: str | None = None


class EmptyResult(BaseModel):
    success: bool = True
