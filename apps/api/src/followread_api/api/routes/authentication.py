from typing import Any

from fastapi import APIRouter, Request, Response, status
from starlette.middleware.base import RequestResponseEndpoint

from followread_api.api.dependencies import AuthenticationServiceDependency
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import (
    LoginRequest,
    SessionResponse,
    authenticated_user_response,
    issued_session_response,
)
from followread_api.config import get_settings
from followread_api.security.session import (
    CSRF_COOKIE,
    SESSION_COOKIE,
    SESSION_MAX_AGE_SECONDS,
)
from followread_api.services import (
    AuthenticationRequiredError,
    InvalidCsrfTokenError,
    InvalidOriginError,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
AUTHENTICATION_ERROR: dict[int | str, dict[str, Any]] = {
    401: {"model": ErrorResponse, "description": "Authentication failed or session is invalid"},
    403: {"model": ErrorResponse, "description": "Browser request security validation failed"},
}


async def authentication_cache_control(
    request: Request,
    call_next: RequestResponseEndpoint,
) -> Response:
    response = await call_next(request)
    auth_prefix = f"{get_settings().api_prefix}/auth"
    if request.url.path.startswith(auth_prefix):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
    return response


def _require_trusted_origin(request: Request) -> None:
    if request.headers.get("origin") not in get_settings().allowed_origins:
        raise InvalidOriginError


def _set_authentication_cookies(
    response: Response,
    session_token: str,
    csrf_token: str,
) -> None:
    secure = get_settings().environment == "production"
    response.set_cookie(
        SESSION_COOKIE,
        session_token,
        max_age=SESSION_MAX_AGE_SECONDS,
        httponly=True,
        secure=secure,
        samesite="strict",
        path="/",
    )
    response.set_cookie(
        CSRF_COOKIE,
        csrf_token,
        max_age=SESSION_MAX_AGE_SECONDS,
        httponly=False,
        secure=secure,
        samesite="strict",
        path="/",
    )


def _clear_authentication_cookies(response: Response) -> None:
    secure = get_settings().environment == "production"
    response.delete_cookie(
        SESSION_COOKIE,
        httponly=True,
        secure=secure,
        samesite="strict",
        path="/",
    )
    response.delete_cookie(
        CSRF_COOKIE,
        httponly=False,
        secure=secure,
        samesite="strict",
        path="/",
    )


@router.post(
    "/login",
    response_model=SessionResponse,
    responses=AUTHENTICATION_ERROR,
)
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    service: AuthenticationServiceDependency,
) -> SessionResponse:
    _require_trusted_origin(request)
    issued_session = service.login(
        body.email,
        body.password,
        correlation_id=request.state.request_id,
    )
    _set_authentication_cookies(
        response,
        issued_session.session_token,
        issued_session.csrf_token,
    )
    return issued_session_response(issued_session)


@router.get(
    "/session",
    response_model=SessionResponse,
    responses=AUTHENTICATION_ERROR,
)
def current_session(
    request: Request,
    service: AuthenticationServiceDependency,
) -> SessionResponse:
    session_token = request.cookies.get(SESSION_COOKIE)
    if session_token is None:
        raise AuthenticationRequiredError
    user = service.current(session_token)
    return SessionResponse(user=authenticated_user_response(user))


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    responses=AUTHENTICATION_ERROR,
)
def logout(
    request: Request,
    response: Response,
    service: AuthenticationServiceDependency,
) -> None:
    _require_trusted_origin(request)
    session_token = request.cookies.get(SESSION_COOKIE)
    if session_token is not None:
        csrf_cookie = request.cookies.get(CSRF_COOKIE)
        csrf_header = request.headers.get("x-csrf-token")
        if csrf_cookie is None or csrf_header is None or csrf_cookie != csrf_header:
            raise InvalidCsrfTokenError
        service.validate_csrf(session_token, csrf_header)
        service.logout(
            session_token,
            correlation_id=request.state.request_id,
        )
    _clear_authentication_cookies(response)
