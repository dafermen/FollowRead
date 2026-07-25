from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from followread_api.database import get_database_session
from followread_api.repositories import PublishedCatalogRepository
from followread_api.security.session import SESSION_COOKIE
from followread_api.services import (
    AuthenticatedUser,
    AuthenticationRequiredError,
    AuthenticationService,
    CatalogService,
    require_permission,
)

DatabaseSession = Annotated[Session, Depends(get_database_session)]


def get_catalog_service(session: DatabaseSession) -> CatalogService:
    return CatalogService(PublishedCatalogRepository(session))


CatalogServiceDependency = Annotated[CatalogService, Depends(get_catalog_service)]


def get_authentication_service(session: DatabaseSession) -> AuthenticationService:
    return AuthenticationService(session)


AuthenticationServiceDependency = Annotated[
    AuthenticationService,
    Depends(get_authentication_service),
]


def get_authenticated_user(
    request: Request,
    service: AuthenticationServiceDependency,
) -> AuthenticatedUser:
    session_token = request.cookies.get(SESSION_COOKIE)
    if session_token is None:
        raise AuthenticationRequiredError
    return service.current(session_token)


AuthenticatedUserDependency = Annotated[
    AuthenticatedUser,
    Depends(get_authenticated_user),
]


@dataclass(frozen=True)
class PermissionRequirement:
    permission_code: str

    def __call__(self, user: AuthenticatedUserDependency) -> AuthenticatedUser:
        return require_permission(user, self.permission_code)
