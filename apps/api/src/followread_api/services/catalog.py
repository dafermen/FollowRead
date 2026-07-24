import re
from typing import Protocol

from followread_api.models import ReadingContent
from followread_api.repositories import CatalogFilters, CatalogPage
from followread_api.services.errors import ContentNotFoundError, InvalidCatalogQueryError

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_PAGE_SIZE = 100
MAX_SLUG_LENGTH = 120


class CatalogReader(Protocol):
    def list(self, filters: CatalogFilters) -> CatalogPage: ...

    def get_by_slug(self, slug: str) -> ReadingContent | None: ...


class CatalogService:
    def __init__(self, repository: CatalogReader) -> None:
        self._repository = repository

    def list_catalog(self, filters: CatalogFilters) -> CatalogPage:
        if not 1 <= filters.limit <= MAX_PAGE_SIZE:
            raise InvalidCatalogQueryError("limit", f"must be between 1 and {MAX_PAGE_SIZE}")
        if filters.offset < 0:
            raise InvalidCatalogQueryError("offset", "must be greater than or equal to 0")
        if filters.category_slug is not None:
            self._validate_slug(filters.category_slug, "category_slug", MAX_SLUG_LENGTH)
        return self._repository.list(filters)

    def get_content(self, slug: str) -> ReadingContent:
        self._validate_slug(slug, "slug", MAX_SLUG_LENGTH)
        content = self._repository.get_by_slug(slug)
        if content is None:
            raise ContentNotFoundError(slug)
        return content

    @staticmethod
    def _validate_slug(slug: str, field: str, maximum_length: int) -> None:
        if len(slug) > maximum_length or SLUG_PATTERN.fullmatch(slug) is None:
            raise InvalidCatalogQueryError(
                field,
                "must be a lowercase slug containing only letters, numbers, and single hyphens",
            )
