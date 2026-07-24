from datetime import UTC, datetime

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine, create_session_factory
from followread_api.models import (
    Audience,
    Base,
    Category,
    Chapter,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Language,
    Paragraph,
    Publication,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
)
from followread_api.repositories import (
    CatalogFilters,
    PublishedCatalogRepository,
    SqlAlchemyRepository,
    SqlAlchemyUnitOfWork,
)


def make_content(
    *,
    slug: str,
    level: ReadingLevel,
    category: Category,
    content_type: ContentType = ContentType.STORY,
    audience: Audience = Audience.CHILDREN,
    status: EditorialStatus = EditorialStatus.PUBLISHED,
    active: bool = True,
    complete_package: bool = True,
    languages: tuple[Language, ...] = (Language.ENGLISH,),
) -> ReadingContent:
    content = ReadingContent(
        slug=slug,
        content_type=content_type,
        audience=audience,
        reading_level=level,
        categories=[category],
    )
    version = ContentVersion(
        version_number=1,
        status=status,
        checksum="sha256:" + ("a" * 64) if complete_package else None,
        package_url=f"/content/{slug}/1.json" if complete_package else None,
    )
    for language in languages:
        translation = ContentTranslation(
            language=language,
            title=f"{slug}-{language.value}",
            summary="A summary.",
        )
        chapter = Chapter(stable_key="chapter-1", position=0, title="Chapter")
        chapter.paragraphs.append(
            Paragraph(stable_key="paragraph-1", position=0, text="Readable text."),
        )
        translation.chapters.append(chapter)
        version.translations.append(translation)
    content.versions.append(version)
    content.publication = Publication(
        version=version,
        is_active=active,
        published_at=datetime.now(UTC),
    )
    return content


def seed_catalog(session: Session) -> None:
    level = ReadingLevel(
        code=ReadingLevelCode.BEGINNER,
        label="Beginner",
        display_order=0,
    )
    bedtime = Category(slug="bedtime", name="Bedtime")
    science = Category(slug="science", name="Science")
    session.add_all(
        [
            make_content(
                slug="alpha-story",
                level=level,
                category=bedtime,
                languages=(Language.ENGLISH, Language.SPANISH),
            ),
            make_content(
                slug="beta-article",
                level=level,
                category=science,
                content_type=ContentType.ARTICLE,
                audience=Audience.ADULT,
            ),
            make_content(
                slug="draft-story",
                level=level,
                category=bedtime,
                status=EditorialStatus.DRAFT,
            ),
            make_content(
                slug="inactive-story",
                level=level,
                category=bedtime,
                active=False,
            ),
            make_content(
                slug="incomplete-story",
                level=level,
                category=bedtime,
                complete_package=False,
            ),
        ],
    )
    session.commit()


def test_catalog_lists_only_complete_publications_with_pagination() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        seed_catalog(session)
        page = PublishedCatalogRepository(session).list(CatalogFilters(limit=1, offset=1))

        assert page.total == 2
        assert page.limit == 1
        assert page.offset == 1
        assert [content.slug for content in page.items] == ["beta-article"]
        assert page.items[0].publication is not None
        assert page.items[0].publication.version.translations[0].title == "beta-article-en"

    engine.dispose()


def test_catalog_applies_all_supported_filters() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        seed_catalog(session)
        page = PublishedCatalogRepository(session).list(
            CatalogFilters(
                language=Language.SPANISH,
                content_type=ContentType.STORY,
                audience=Audience.CHILDREN,
                reading_level=ReadingLevelCode.BEGINNER,
                category_slug="bedtime",
            ),
        )

        assert page.total == 1
        assert [content.slug for content in page.items] == ["alpha-story"]
        assert page.items[0].reading_level.code is ReadingLevelCode.BEGINNER
        assert [category.slug for category in page.items[0].categories] == ["bedtime"]

    engine.dispose()


def test_catalog_detail_loads_editorial_tree_and_returns_none_when_missing() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        seed_catalog(session)
        repository = PublishedCatalogRepository(session)

        content = repository.get_by_slug("alpha-story")

        assert content is not None
        assert content.publication is not None
        translations = content.publication.version.translations
        assert [translation.language for translation in translations] == [
            Language.ENGLISH,
            Language.SPANISH,
        ]
        assert translations[0].chapters[0].paragraphs[0].text == "Readable text."
        assert repository.get_by_slug("draft-story") is None
        assert repository.get_by_slug("missing") is None

    engine.dispose()


def test_base_repository_and_unit_of_work_commit_and_remove() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)

    with SqlAlchemyUnitOfWork(session_factory) as unit_of_work:
        repository = SqlAlchemyRepository(unit_of_work.session, Category)
        category = repository.add(Category(slug="history", name="History"))
        unit_of_work.session.flush()
        assert repository.get(category.id) is category
        unit_of_work.commit()

    with SqlAlchemyUnitOfWork(session_factory) as unit_of_work:
        repository = SqlAlchemyRepository(unit_of_work.session, Category)
        stored = repository.get(category.id)
        assert stored is not None
        repository.remove(stored)
        unit_of_work.commit()

    with Session(engine) as session:
        assert session.get(Category, category.id) is None

    engine.dispose()


def test_unit_of_work_rolls_back_explicitly_and_on_context_exit() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)

    with SqlAlchemyUnitOfWork(session_factory) as unit_of_work:
        unit_of_work.session.add(Category(slug="temporary", name="Temporary"))
        unit_of_work.rollback()

    with SqlAlchemyUnitOfWork(session_factory) as unit_of_work:
        unit_of_work.session.add(Category(slug="implicit", name="Implicit"))

    with Session(engine) as session:
        assert session.query(Category).count() == 0

    engine.dispose()


def test_duplicate_commit_can_be_rolled_back_without_leaking_transaction() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)

    with SqlAlchemyUnitOfWork(session_factory) as unit_of_work:
        unit_of_work.session.add(Category(slug="duplicate", name="First"))
        unit_of_work.commit()

    with SqlAlchemyUnitOfWork(session_factory) as unit_of_work:
        unit_of_work.session.add(Category(slug="duplicate", name="Second"))
        with pytest.raises(IntegrityError):
            unit_of_work.commit()
        unit_of_work.rollback()

    with Session(engine) as session:
        assert session.query(Category).count() == 1

    engine.dispose()
