from typing import Annotated, Any

from fastapi import APIRouter, Depends

from followread_api.api.dependencies import DatabaseSession, PermissionRequirement
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import (
    AuthenticatedUserResponse,
    DashboardSummaryResponse,
    authenticated_user_response,
    dashboard_summary_response,
)
from followread_api.services import AuthenticatedUser, DashboardService

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
