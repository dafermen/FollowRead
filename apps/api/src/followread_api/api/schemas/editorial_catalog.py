from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from followread_api.models import ContentType, EditorialStatus, Language
from followread_api.services.editorial_catalog import EditorialCatalogPage


class EditorialCatalogItemResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    content_type: ContentType
    audience: str
    languages: list[Language]
    version: int
    status: EditorialStatus
    updated_at: datetime
    actions: list[str]


class EditorialCatalogPageResponse(BaseModel):
    items: list[EditorialCatalogItemResponse]
    total: int
    limit: int
    offset: int


def editorial_catalog_page_response(page: EditorialCatalogPage) -> EditorialCatalogPageResponse:
    return EditorialCatalogPageResponse(
        items=[
            EditorialCatalogItemResponse(
                id=item.id,
                slug=item.slug,
                title=item.title,
                content_type=item.content_type,
                audience=item.audience,
                languages=list(item.languages),
                version=item.version,
                status=item.status,
                updated_at=item.updated_at,
                actions=list(item.actions),
            )
            for item in page.items
        ],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )
