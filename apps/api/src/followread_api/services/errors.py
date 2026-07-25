from collections.abc import Mapping
from enum import StrEnum
from types import MappingProxyType


class ErrorCode(StrEnum):
    INVALID_CATALOG_QUERY = "catalog.invalid_query"
    CONTENT_NOT_FOUND = "content.not_found"
    INVALID_CREDENTIALS = "auth.invalid_credentials"
    AUTHENTICATION_REQUIRED = "auth.authentication_required"
    INVALID_CSRF_TOKEN = "auth.invalid_csrf_token"
    INVALID_ORIGIN = "auth.invalid_origin"
    PERMISSION_DENIED = "auth.permission_denied"


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


class InvalidCredentialsError(DomainError):
    def __init__(self) -> None:
        super().__init__(
            ErrorCode.INVALID_CREDENTIALS,
            "The email or password is invalid.",
        )


class AuthenticationRequiredError(DomainError):
    def __init__(self) -> None:
        super().__init__(
            ErrorCode.AUTHENTICATION_REQUIRED,
            "A valid session is required.",
        )


class InvalidCsrfTokenError(DomainError):
    def __init__(self) -> None:
        super().__init__(
            ErrorCode.INVALID_CSRF_TOKEN,
            "The request security token is invalid.",
        )


class InvalidOriginError(DomainError):
    def __init__(self) -> None:
        super().__init__(
            ErrorCode.INVALID_ORIGIN,
            "The request origin is not allowed.",
        )


class PermissionDeniedError(DomainError):
    def __init__(self) -> None:
        super().__init__(
            ErrorCode.PERMISSION_DENIED,
            "You do not have permission to perform this action.",
        )
