from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, Query, Request, status

from followread_api.api.dependencies import (
    AuthenticationServiceDependency,
    DatabaseSession,
    PermissionRequirement,
)
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import (
    AuthenticatedUserResponse,
    CreateEditorialContentRequest,
    DashboardSummaryResponse,
    EditorialCatalogItemResponse,
    EditorialCatalogPageResponse,
    authenticated_user_response,
    dashboard_summary_response,
    editorial_catalog_item_response,
    editorial_catalog_page_response,
)
from followread_api.config import get_settings
from followread_api.models import ContentType, EditorialStatus
from followread_api.security.session import CSRF_COOKIE, SESSION_COOKIE
from followread_api.services import (
    AuthenticatedUser,
    DashboardService,
    EditorialCatalogFilters,
    EditorialCatalogService,
    InvalidCsrfTokenError,
    InvalidOriginError,
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
ContentCreatorUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("content.create")),
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


@router.post(
    "/content",
    response_model=EditorialCatalogItemResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        **ACCESS_ERRORS,
        422: {"model": ErrorResponse, "description": "Invalid or duplicate content metadata"},
    },
)
def create_editorial_content(
    body: CreateEditorialContentRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentCreatorUser,
) -> EditorialCatalogItemResponse:
    _validate_mutation_request(request, authentication)
    item = EditorialCatalogService(session).create_draft(
        body.to_command(),
        actor_user_id=user.id,
        permissions=frozenset(user.permissions),
        correlation_id=request.state.request_id,
    )
    return editorial_catalog_item_response(item)


def _validate_mutation_request(
    request: Request,
    authentication: AuthenticationServiceDependency,
) -> None:
    if request.headers.get("origin") not in get_settings().allowed_origins:
        raise InvalidOriginError
    session_token = request.cookies.get(SESSION_COOKIE)
    csrf_cookie = request.cookies.get(CSRF_COOKIE)
    csrf_header = request.headers.get("x-csrf-token")
    if (
        session_token is None
        or csrf_cookie is None
        or csrf_header is None
        or csrf_cookie != csrf_header
    ):
        raise InvalidCsrfTokenError
    authentication.validate_csrf(session_token, csrf_header)
