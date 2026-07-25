from typing import Annotated, Any

from fastapi import APIRouter, Depends

from followread_api.api.dependencies import PermissionRequirement
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import AuthenticatedUserResponse, authenticated_user_response
from followread_api.services import AuthenticatedUser

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
