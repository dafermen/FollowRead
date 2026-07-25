"""Application services and stable domain errors."""

from followread_api.services.authentication import (
    AuthenticatedUser,
    AuthenticationService,
    IssuedSession,
)
from followread_api.services.authorization import (
    PERMISSION_DESCRIPTIONS,
    ROLE_PERMISSION_MATRIX,
    ensure_rbac_matrix,
    require_permission,
)
from followread_api.services.bootstrap import (
    BootstrapConflictError,
    BootstrapInputError,
    BootstrapResult,
    bootstrap_superadmin,
)
from followread_api.services.catalog import CatalogReader, CatalogService
from followread_api.services.dashboard import DashboardService, DashboardSummary
from followread_api.services.editorial_catalog import (
    EditorialCatalogFilters,
    EditorialCatalogPage,
    EditorialCatalogService,
)
from followread_api.services.errors import (
    AuthenticationRequiredError,
    ContentNotFoundError,
    DomainError,
    ErrorCode,
    InvalidCatalogQueryError,
    InvalidCredentialsError,
    InvalidCsrfTokenError,
    InvalidOriginError,
    PermissionDeniedError,
)

__all__ = [
    "PERMISSION_DESCRIPTIONS",
    "ROLE_PERMISSION_MATRIX",
    "AuthenticatedUser",
    "AuthenticationRequiredError",
    "AuthenticationService",
    "BootstrapConflictError",
    "BootstrapInputError",
    "BootstrapResult",
    "CatalogReader",
    "CatalogService",
    "ContentNotFoundError",
    "DashboardService",
    "DashboardSummary",
    "DomainError",
    "EditorialCatalogFilters",
    "EditorialCatalogPage",
    "EditorialCatalogService",
    "ErrorCode",
    "InvalidCatalogQueryError",
    "InvalidCredentialsError",
    "InvalidCsrfTokenError",
    "InvalidOriginError",
    "IssuedSession",
    "PermissionDeniedError",
    "bootstrap_superadmin",
    "ensure_rbac_matrix",
    "require_permission",
]
