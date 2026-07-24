from dataclasses import dataclass

import pytest

from followread_api.models import Audience, ContentType, ReadingContent
from followread_api.repositories import CatalogFilters, CatalogPage
from followread_api.services import (
    CatalogService,
    ContentNotFoundError,
    ErrorCode,
    InvalidCatalogQueryError,
)


@dataclass
class StubCatalog:
    page: CatalogPage
    content: ReadingContent | None = None
    received_filters: CatalogFilters | None = None
    received_slug: str | None = None

    def list(self, filters: CatalogFilters) -> CatalogPage:
        self.received_filters = filters
        return self.page

    def get_by_slug(self, slug: str) -> ReadingContent | None:
        self.received_slug = slug
        return self.content


def empty_page() -> CatalogPage:
    return CatalogPage(items=[], total=0, limit=20, offset=0)


def test_catalog_service_passes_validated_filters_to_repository() -> None:
    repository = StubCatalog(page=empty_page())
    service = CatalogService(repository)
    filters = CatalogFilters(category_slug="short-stories", limit=10, offset=20)

    result = service.list_catalog(filters)

    assert result is repository.page
    assert repository.received_filters is filters


@pytest.mark.parametrize(
    ("filters", "field"),
    [
        (CatalogFilters(limit=0), "limit"),
        (CatalogFilters(limit=101), "limit"),
        (CatalogFilters(offset=-1), "offset"),
        (CatalogFilters(category_slug="Invalid Slug"), "category_slug"),
        (CatalogFilters(category_slug="a" * 121), "category_slug"),
    ],
)
def test_catalog_service_rejects_invalid_queries(
    filters: CatalogFilters,
    field: str,
) -> None:
    service = CatalogService(StubCatalog(page=empty_page()))

    with pytest.raises(InvalidCatalogQueryError) as error:
        service.list_catalog(filters)

    assert error.value.code is ErrorCode.INVALID_CATALOG_QUERY
    assert error.value.message == "The catalog query is invalid."
    assert field in error.value.details


def test_catalog_service_returns_available_content() -> None:
    content = ReadingContent(
        slug="moon-story",
        content_type=ContentType.STORY,
        audience=Audience.ALL,
    )
    repository = StubCatalog(page=empty_page(), content=content)

    result = CatalogService(repository).get_content("moon-story")

    assert result is content
    assert repository.received_slug == "moon-story"


def test_catalog_service_reports_invalid_and_unavailable_slugs() -> None:
    service = CatalogService(StubCatalog(page=empty_page()))

    with pytest.raises(InvalidCatalogQueryError):
        service.get_content("")

    with pytest.raises(ContentNotFoundError) as error:
        service.get_content("missing-story")

    assert error.value.code is ErrorCode.CONTENT_NOT_FOUND
    assert error.value.details == {"slug": "missing-story"}
