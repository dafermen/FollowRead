from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from followread_api.api.schemas import editorial_catalog_page_response
from followread_api.database import create_database_engine
from followread_api.models import (
    Audience,
    Base,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Language,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
)
from followread_api.services import EditorialCatalogFilters, EditorialCatalogService

ALL_CONTENT_PERMISSIONS = frozenset(
    {
        "content.edit",
        "content.process",
        "content.review",
        "content.publish",
    },
)


def test_editorial_catalog_filters_sorts_paginates_and_assigns_actions() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)

    with Session(engine) as session:
        level = ReadingLevel(
            code=ReadingLevelCode.BEGINNER,
            label="Beginner",
            display_order=1,
        )
        contents = [
            _content(
                level,
                "draft-story",
                "Cuento inicial",
                EditorialStatus.DRAFT,
                now - timedelta(hours=5),
                ContentType.STORY,
            ),
            _content(
                level,
                "review-lesson",
                "Lección a revisar",
                EditorialStatus.READY_FOR_REVIEW,
                now - timedelta(hours=4),
                ContentType.LESSON,
                bilingual=True,
            ),
            _content(
                level,
                "approved-article",
                "Artículo aprobado",
                EditorialStatus.APPROVED,
                now - timedelta(hours=3),
                ContentType.ARTICLE,
            ),
            _content(
                level,
                "published-book",
                "Libro publicado",
                EditorialStatus.PUBLISHED,
                now - timedelta(hours=2),
                ContentType.BOOK,
            ),
            _content(
                level,
                "archived-story",
                None,
                EditorialStatus.ARCHIVED,
                now - timedelta(hours=1),
                ContentType.STORY,
            ),
            ReadingContent(
                slug="without-version",
                content_type=ContentType.STORY,
                audience=Audience.ALL,
                reading_level=level,
            ),
        ]
        session.add_all(contents)
        session.commit()

        service = EditorialCatalogService(session)
        recent_page = service.list_content(
            EditorialCatalogFilters(limit=2, offset=1),
            ALL_CONTENT_PERMISSIONS,
        )
        assert recent_page.total == 5
        assert [item.title for item in recent_page.items] == [
            "Libro publicado",
            "Artículo aprobado",
        ]

        title_page = service.list_content(
            EditorialCatalogFilters(
                search="  REVISAR ",
                status=EditorialStatus.READY_FOR_REVIEW,
                content_type=ContentType.LESSON,
                sort="title",
            ),
            ALL_CONTENT_PERMISSIONS,
        )
        response = editorial_catalog_page_response(title_page)
        assert response.total == 1
        assert response.items[0].languages == [Language.ENGLISH, Language.SPANISH]
        assert response.items[0].actions == ["view", "edit", "review"]

        status_page = service.list_content(
            EditorialCatalogFilters(sort="status"),
            ALL_CONTENT_PERMISSIONS,
        )
        actions = {item.status: item.actions for item in status_page.items}
        assert actions[EditorialStatus.DRAFT] == ("view", "edit", "process")
        assert actions[EditorialStatus.APPROVED] == ("view", "edit", "publish")
        assert actions[EditorialStatus.PUBLISHED] == ("view",)
        assert actions[EditorialStatus.ARCHIVED] == ("view",)
        assert status_page.items[0].title == "Artículo aprobado"
        assert any(item.title == "Archived Story" for item in status_page.items)

        no_result = service.list_content(
            EditorialCatalogFilters(search="missing", content_type=ContentType.BOOK),
            frozenset(),
        )
        assert no_result.items == ()
        assert no_result.total == 0

    engine.dispose()


def _content(
    level: ReadingLevel,
    slug: str,
    title: str | None,
    status: EditorialStatus,
    updated_at: datetime,
    content_type: ContentType,
    *,
    bilingual: bool = False,
) -> ReadingContent:
    translations = (
        []
        if title is None
        else [
            ContentTranslation(language=Language.SPANISH, title=title),
            *(
                [ContentTranslation(language=Language.ENGLISH, title="Review lesson")]
                if bilingual
                else []
            ),
        ]
    )
    return ReadingContent(
        slug=slug,
        content_type=content_type,
        audience=Audience.ALL,
        reading_level=level,
        versions=[
            ContentVersion(
                version_number=1,
                status=status,
                minimum_app_version="1.0.0",
                updated_at=updated_at,
                translations=translations,
            ),
        ],
    )
