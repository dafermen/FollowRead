from typing import Annotated, Any

from fastapi import APIRouter, Query

from followread_api.api.dependencies import CatalogServiceDependency, DatabaseSession
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import (
    CatalogPageResponse,
    ContentDetailResponse,
    ReaderPackageResponse,
    catalog_page_response,
    content_detail_response,
    reader_package_response,
)
from followread_api.models import Audience, ContentType, Language, ReadingLevelCode
from followread_api.repositories import CatalogFilters
from followread_api.services import ReaderPackageService

router = APIRouter(prefix="/catalog", tags=["catalog"])

ERROR_RESPONSES: dict[int | str, dict[str, Any]] = {
    404: {"model": ErrorResponse, "description": "Published content not found"},
    422: {"model": ErrorResponse, "description": "Invalid catalog query"},
}


@router.get(
    "",
    response_model=CatalogPageResponse,
    responses={422: ERROR_RESPONSES[422]},
)
def list_catalog(
    service: CatalogServiceDependency,
    language: Language | None = None,
    content_type: ContentType | None = None,
    audience: Audience | None = None,
    reading_level: ReadingLevelCode | None = None,
    category: Annotated[str | None, Query(max_length=120)] = None,
    limit: int = 20,
    offset: int = 0,
) -> CatalogPageResponse:
    page = service.list_catalog(
        CatalogFilters(
            language=language,
            content_type=content_type,
            audience=audience,
            reading_level=reading_level,
            category_slug=category,
            limit=limit,
            offset=offset,
        ),
    )
    return catalog_page_response(page)


@router.get(
    "/{slug}/reader-package",
    response_model=ReaderPackageResponse,
    responses=ERROR_RESPONSES,
)
def get_reader_package(slug: str, session: DatabaseSession) -> ReaderPackageResponse:
    return reader_package_response(ReaderPackageService(session).get_package(slug))


@router.get(
    "/{slug}",
    response_model=ContentDetailResponse,
    responses=ERROR_RESPONSES,
)
def get_content(slug: str, service: CatalogServiceDependency) -> ContentDetailResponse:
    return content_detail_response(service.get_content(slug))
