from fastapi import FastAPI

from followread_api import __version__
from followread_api.api.errors import domain_error_handler
from followread_api.api.routes.catalog import router as catalog_router
from followread_api.api.routes.health import router as health_router
from followread_api.config import get_settings
from followread_api.observability import configure_logging, request_observability
from followread_api.services import DomainError


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()
    application = FastAPI(
        title=settings.app_name,
        version=__version__,
        docs_url="/docs",
        redoc_url=None,
    )
    application.middleware("http")(request_observability)
    application.add_exception_handler(DomainError, domain_error_handler)
    application.include_router(health_router, prefix=settings.api_prefix)
    application.include_router(catalog_router, prefix=settings.api_prefix)
    return application


app = create_app()
