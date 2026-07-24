from collections.abc import Mapping
from enum import StrEnum
from types import MappingProxyType


class ErrorCode(StrEnum):
    INVALID_CATALOG_QUERY = "catalog.invalid_query"
    CONTENT_NOT_FOUND = "content.not_found"


class DomainError(Exception):
    """Expected business failure safe to expose through an API contract."""

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        *,
        details: Mapping[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = MappingProxyType(dict(details or {}))


class InvalidCatalogQueryError(DomainError):
    def __init__(self, field: str, reason: str) -> None:
        super().__init__(
            ErrorCode.INVALID_CATALOG_QUERY,
            "The catalog query is invalid.",
            details={field: reason},
        )


class ContentNotFoundError(DomainError):
    def __init__(self, slug: str) -> None:
        super().__init__(
            ErrorCode.CONTENT_NOT_FOUND,
            "The requested content is not available.",
            details={"slug": slug},
        )
