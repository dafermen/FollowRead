from typing import Annotated, cast

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from followread_api.services import DomainError, ErrorCode

ERROR_STATUS = {
    ErrorCode.INVALID_CATALOG_QUERY: 422,
    ErrorCode.CONTENT_NOT_FOUND: 404,
    ErrorCode.INVALID_CREDENTIALS: 401,
    ErrorCode.AUTHENTICATION_REQUIRED: 401,
    ErrorCode.INVALID_CSRF_TOKEN: 403,
    ErrorCode.INVALID_ORIGIN: 403,
    ErrorCode.PERMISSION_DENIED: 403,
    ErrorCode.EDITOR_CONFLICT: 409,
}


class ErrorBody(BaseModel):
    code: ErrorCode
    message: str
    details: dict[str, str]


class ErrorResponse(BaseModel):
    error: Annotated[ErrorBody, Field(description="Stable, machine-readable error")]


async def domain_error_handler(_: Request, error: Exception) -> JSONResponse:
    domain_error = cast(DomainError, error)
    response = ErrorResponse(
        error=ErrorBody(
            code=domain_error.code,
            message=domain_error.message,
            details=dict(domain_error.details),
        ),
    )
    return JSONResponse(
        status_code=ERROR_STATUS[domain_error.code],
        content=response.model_dump(mode="json"),
    )
