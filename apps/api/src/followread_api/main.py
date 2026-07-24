from fastapi import FastAPI

from followread_api import __version__
from followread_api.api.errors import domain_error_handler
from followread_api.api.routes.health import router as health_router
from followread_api.config import get_settings
from followread_api.services import DomainError


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version=__version__,
        docs_url="/docs",
        redoc_url=None,
    )
    application.add_exception_handler(DomainError, domain_error_handler)
    application.include_router(health_router, prefix=settings.api_prefix)
    return application


app = create_app()
