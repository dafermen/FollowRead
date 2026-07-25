from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, Query

from followread_api.api.dependencies import DatabaseSession, PermissionRequirement
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import (
    AuthenticatedUserResponse,
    DashboardSummaryResponse,
    EditorialCatalogPageResponse,
    authenticated_user_response,
    dashboard_summary_response,
    editorial_catalog_page_response,
)
from followread_api.models import ContentType, EditorialStatus
from followread_api.services import (
    AuthenticatedUser,
    DashboardService,
    EditorialCatalogFilters,
    EditorialCatalogService,
)

router = APIRouter(prefix="/admin", tags=["administration"])
ACCESS_ERRORS: dict[int | str, dict[str, Any]] = {
    401: {"model": ErrorResponse, "description": "A valid session is required"},
    403: {"model": ErrorResponse, "description": "The account lacks the required permission"},
}
AdminAccessUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("admin.access")),
]


@router.get(
    "/access",
    response_model=AuthenticatedUserResponse,
    responses=ACCESS_ERRORS,
)
def verify_admin_access(user: AdminAccessUser) -> AuthenticatedUserResponse:
    return authenticated_user_response(user)


@router.get(
    "/dashboard",
    response_model=DashboardSummaryResponse,
    responses=ACCESS_ERRORS,
)
def get_dashboard_summary(
    session: DatabaseSession,
    _user: AdminAccessUser,
) -> DashboardSummaryResponse:
    return dashboard_summary_response(DashboardService(session).get_summary())


@router.get(
    "/content",
    response_model=EditorialCatalogPageResponse,
    responses=ACCESS_ERRORS,
)
def list_editorial_content(
    session: DatabaseSession,
    user: AdminAccessUser,
    search: Annotated[str | None, Query(max_length=240)] = None,
    status: EditorialStatus | None = None,
    content_type: ContentType | None = None,
    sort: Literal["recent", "title", "status"] = "recent",
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> EditorialCatalogPageResponse:
    page = EditorialCatalogService(session).list_content(
        EditorialCatalogFilters(
            search=search,
            status=status,
            content_type=content_type,
            sort=sort,
            limit=limit,
            offset=offset,
        ),
        frozenset(user.permissions),
    )
    return editorial_catalog_page_response(page)
