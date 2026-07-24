from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from followread_api import __version__
from followread_api.config import Settings, get_settings

router = APIRouter(tags=["system"])


class HealthResponse(BaseModel):
    service: str
    status: Literal["ok"]
    version: str
    environment: str


@router.get("/health", response_model=HealthResponse)
def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(
        service=settings.app_name,
        status="ok",
        version=__version__,
        environment=settings.environment,
    )
