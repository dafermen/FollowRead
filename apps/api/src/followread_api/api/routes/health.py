from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from sqlalchemy import Engine
from sqlalchemy.exc import SQLAlchemyError

from followread_api import __version__
from followread_api.config import Settings, get_settings
from followread_api.database import check_database, get_database_engine
from followread_api.observability import render_prometheus_metrics, request_metrics

router = APIRouter(tags=["system"])


class HealthResponse(BaseModel):
    service: str
    status: Literal["ok"]
    version: str
    environment: str


class ReadinessResponse(BaseModel):
    service: str
    status: Literal["ready"]
    checks: dict[str, Literal["ok"]]


class ReadinessErrorResponse(BaseModel):
    service: str
    status: Literal["not_ready"]
    checks: dict[str, Literal["unavailable"]]


@router.get("/health", response_model=HealthResponse)
def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(
        service=settings.app_name,
        status="ok",
        version=__version__,
        environment=settings.environment,
    )


def database_is_ready(engine: Engine) -> bool:
    try:
        return check_database(engine)
    except SQLAlchemyError:
        return False


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={503: {"model": ReadinessErrorResponse}},
)
def readiness(
    settings: Annotated[Settings, Depends(get_settings)],
    engine: Annotated[Engine, Depends(get_database_engine)],
) -> ReadinessResponse | JSONResponse:
    if not database_is_ready(engine):
        response = ReadinessErrorResponse(
            service=settings.app_name,
            status="not_ready",
            checks={"database": "unavailable"},
        )
        return JSONResponse(status_code=503, content=response.model_dump())
    return ReadinessResponse(
        service=settings.app_name,
        status="ready",
        checks={"database": "ok"},
    )


@router.get(
    "/metrics",
    response_class=PlainTextResponse,
    include_in_schema=False,
)
def metrics() -> PlainTextResponse:
    return PlainTextResponse(
        render_prometheus_metrics(request_metrics.snapshot()),
        media_type="text/plain; version=0.0.4",
    )
