from datetime import UTC, datetime

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
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


def build_published_story(session: Session) -> ReadingContent:
    level = ReadingLevel(
        code=ReadingLevelCode.BEGINNER,
        label="Beginner",
        display_order=0,
    )
    category = Category(slug="bedtime", name="Bedtime")
    content = ReadingContent(
        slug="moon-story",
        content_type=ContentType.STORY,
        audience=Audience.CHILDREN,
        reading_level=level,
        categories=[category],
    )
    version = ContentVersion(
        version_number=1,
        status=EditorialStatus.PUBLISHED,
        checksum="sha256:" + ("a" * 64),
        package_url="/content/moon-story/version/1/package.json",
    )
    translation = ContentTranslation(
        language=Language.ENGLISH,
        title="The Moon",
        summary="A short story.",
    )
    chapter = Chapter(stable_key="chapter-1", position=0, title="Night")
    chapter.paragraphs.append(
        Paragraph(stable_key="paragraph-1", position=0, text="The moon is bright."),
    )
    translation.chapters.append(chapter)
    version.translations.append(translation)
    content.versions.append(version)
    content.publication = Publication(
        version=version,
        published_at=datetime.now(UTC),
    )
    session.add(content)
    session.commit()
    return content


def test_editorial_aggregate_persists_ordered_relationships() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        content = build_published_story(session)
        session.refresh(content)

        assert content.reading_level.code is ReadingLevelCode.BEGINNER
        assert [category.slug for category in content.categories] == ["bedtime"]
        assert content.publication is not None
        assert content.publication.is_active
        assert content.publication.version.status is EditorialStatus.PUBLISHED
        assert content.versions[0].translations[0].chapters[0].paragraphs[0].text == (
            "The moon is bright."
        )

    engine.dispose()


def test_version_number_is_unique_within_content() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        content = build_published_story(session)
        session.add(
            ContentVersion(
                reading_content_id=content.id,
                version_number=1,
                status=EditorialStatus.DRAFT,
            ),
        )
        with pytest.raises(IntegrityError):
            session.commit()

    engine.dispose()


def test_draft_version_deletion_cascades_editorial_structure() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        level = ReadingLevel(
            code=ReadingLevelCode.ELEMENTARY,
            label="Elementary",
            display_order=1,
        )
        content = ReadingContent(
            slug="draft-story",
            content_type=ContentType.STORY,
            audience=Audience.ALL,
            reading_level=level,
        )
        version = ContentVersion(version_number=1)
        translation = ContentTranslation(language=Language.SPANISH, title="Borrador")
        chapter = Chapter(stable_key="chapter-1", position=0)
        chapter.paragraphs.append(Paragraph(stable_key="paragraph-1", position=0, text="Texto"))
        translation.chapters.append(chapter)
        version.translations.append(translation)
        content.versions.append(version)
        session.add(content)
        session.commit()

        session.delete(version)
        session.commit()

        assert session.scalars(select(ContentTranslation)).all() == []
        assert session.scalars(select(Chapter)).all() == []
        assert session.scalars(select(Paragraph)).all() == []

    engine.dispose()
