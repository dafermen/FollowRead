from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from followread_api import __version__
from followread_api.api.errors import domain_error_handler
from followread_api.api.routes.authentication import (
    authentication_cache_control,
)
from followread_api.api.routes.authentication import (
    router as authentication_router,
)
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
    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "X-CSRF-Token", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )
    application.middleware("http")(request_observability)
    application.middleware("http")(authentication_cache_control)
    application.add_exception_handler(DomainError, domain_error_handler)
    application.include_router(health_router, prefix=settings.api_prefix)
    application.include_router(authentication_router, prefix=settings.api_prefix)
    application.include_router(catalog_router, prefix=settings.api_prefix)
    return application


app = create_app()
