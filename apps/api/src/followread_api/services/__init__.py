"""Application services and stable domain errors."""

from followread_api.services.authentication import (
    AuthenticatedUser,
    AuthenticationService,
    IssuedSession,
)
from followread_api.services.bootstrap import (
    BootstrapConflictError,
    BootstrapInputError,
    BootstrapResult,
    bootstrap_superadmin,
)
from followread_api.services.catalog import CatalogReader, CatalogService
from followread_api.services.errors import (
    AuthenticationRequiredError,
    ContentNotFoundError,
    DomainError,
    ErrorCode,
    InvalidCatalogQueryError,
    InvalidCredentialsError,
    InvalidCsrfTokenError,
    InvalidOriginError,
)

__all__ = [
    "AuthenticatedUser",
    "AuthenticationRequiredError",
    "AuthenticationService",
    "BootstrapConflictError",
    "BootstrapInputError",
    "BootstrapResult",
    "CatalogReader",
    "CatalogService",
    "ContentNotFoundError",
    "DomainError",
    "ErrorCode",
    "InvalidCatalogQueryError",
    "InvalidCredentialsError",
    "InvalidCsrfTokenError",
    "InvalidOriginError",
    "IssuedSession",
    "bootstrap_superadmin",
]
