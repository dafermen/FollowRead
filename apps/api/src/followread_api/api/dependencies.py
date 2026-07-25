from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from followread_api.database import get_database_session
from followread_api.repositories import PublishedCatalogRepository
from followread_api.services import AuthenticationService, CatalogService

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
