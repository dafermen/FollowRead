import asyncio
from collections.abc import Generator
from datetime import UTC, datetime

from httpx import ASGITransport, AsyncClient, Response
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from followread_api.database import (
    create_database_engine,
    create_session_factory,
    get_database_session,
)
from followread_api.main import create_app
from followread_api.models import (
    Audience,
    AudioAsset,
    Base,
    Category,
    Chapter,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Illustration,
    Language,
    Paragraph,
    Publication,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
    ResourceStatus,
    SpeechMark,
)


def seed_content(session: Session, slug: str, status: EditorialStatus) -> None:
    level = session.query(ReadingLevel).one_or_none()
    if level is None:
        level = ReadingLevel(
            code=ReadingLevelCode.BEGINNER,
            label="Beginner",
            display_order=0,
        )
    category = Category(slug=f"{slug}-category", name="Short stories")
    content = ReadingContent(
        slug=slug,
        content_type=ContentType.STORY,
        audience=Audience.CHILDREN,
        reading_level=level,
        categories=[category],
    )
    version = ContentVersion(
        version_number=1,
        status=status,
        checksum="sha256:" + ("b" * 64),
        package_url=f"/packages/{slug}.json",
        minimum_app_version="1.0.0",
    )
    translation = ContentTranslation(
        language=Language.ENGLISH,
        title="Moon Story",
        summary="A calm story.",
    )
    chapter = Chapter(stable_key="chapter-1", position=0, title="Night")
    chapter.paragraphs.append(
        Paragraph(stable_key="paragraph-1", position=0, text="The moon is bright."),
    )
    translation.chapters.append(chapter)
    version.translations.append(translation)
    content.versions.append(version)
    version_audio = AudioAsset(
        version=version,
        language=Language.ENGLISH,
        voice_id="Joanna",
        uri="var/audio/moon-story.mp3",
        checksum="sha256:" + ("c" * 64),
        duration_ms=1000,
        status=ResourceStatus.READY,
        speech_marks=[
            SpeechMark(
                paragraph=chapter.paragraphs[0],
                position=0,
                mark_type="word",
                value="The",
                start_ms=0,
                end_ms=280,
                char_start=0,
                char_end=3,
            ),
        ],
    )
    illustration = Illustration(
        version=version,
        position=0,
        uri="/stories/moon-story.png",
        checksum="sha256:" + ("d" * 64),
        alt_text="The moon over a quiet forest.",
        status=ResourceStatus.READY,
    )
    content.publication = Publication(
        version=version,
        published_at=datetime.now(UTC),
    )
    session.add_all([content, version_audio, illustration])
    session.commit()


def build_test_client() -> tuple[AsyncClient, Engine]:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)

    with session_factory() as session:
        seed_content(session, "moon-story", EditorialStatus.PUBLISHED)
        seed_content(session, "draft-story", EditorialStatus.DRAFT)

    def override_session() -> Generator[Session, None, None]:
        with session_factory() as session:
            yield session

    application = create_app()
    application.dependency_overrides[get_database_session] = override_session
    return (
        AsyncClient(
            transport=ASGITransport(app=application),
            base_url="http://test",
        ),
        engine,
    )


def request(method: str, url: str) -> Response:
    async def send() -> Response:
        client, engine = build_test_client()
        try:
            async with client:
                return await client.request(method, url)
        finally:
            engine.dispose()

    return asyncio.run(send())


def test_catalog_endpoint_returns_published_paginated_summary() -> None:
    response = request(
        "GET",
        "/catalog?language=en&content_type=story&audience=children"
        "&reading_level=beginner&category=moon-story-category&limit=10&offset=0",
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["limit"] == 10
    assert payload["offset"] == 0
    assert payload["items"][0] == {
        "id": payload["items"][0]["id"],
        "slug": "moon-story",
        "content_type": "story",
        "audience": "children",
        "reading_level": {"code": "beginner", "label": "Beginner"},
        "categories": [{"slug": "moon-story-category", "name": "Short stories"}],
        "languages": ["en"],
        "version": 1,
        "checksum": "sha256:" + ("b" * 64),
        "package_url": "/packages/moon-story.json",
        "minimum_app_version": "1.0.0",
        "published_at": payload["items"][0]["published_at"],
    }


def test_content_endpoint_returns_complete_editorial_detail() -> None:
    response = request("GET", "/catalog/moon-story")

    assert response.status_code == 200
    payload = response.json()
    assert payload["slug"] == "moon-story"
    assert payload["translations"] == [
        {
            "language": "en",
            "title": "Moon Story",
            "summary": "A calm story.",
            "chapters": [
                {
                    "stable_key": "chapter-1",
                    "position": 0,
                    "title": "Night",
                    "paragraphs": [
                        {
                            "stable_key": "paragraph-1",
                            "position": 0,
                            "text": "The moon is bright.",
                        },
                    ],
                },
            ],
        },
    ]


def test_reader_package_endpoint_returns_timeline_and_resources() -> None:
    response = request("GET", "/catalog/moon-story/reader-package")

    assert response.status_code == 200
    payload = response.json()
    assert payload["slug"] == "moon-story"
    assert payload["cover_uri"] == "/stories/moon-story.png"
    assert payload["translations"][0]["audio"] == {
        "uri": "var/audio/moon-story.mp3",
        "duration_ms": 1000,
        "voice_id": "Joanna",
        "simulated": True,
        "marks": [
            {
                "value": "The",
                "start_ms": 0,
                "end_ms": 280,
                "char_start": 0,
                "char_end": 3,
                "paragraph_key": "paragraph-1",
                "chapter_key": "chapter-1",
            },
        ],
    }


def test_catalog_api_returns_stable_errors_and_excludes_drafts() -> None:
    draft_response = request("GET", "/catalog/draft-story")
    invalid_response = request("GET", "/catalog?limit=0")

    assert draft_response.status_code == 404
    assert draft_response.json()["error"]["code"] == "content.not_found"
    assert invalid_response.status_code == 422
    assert invalid_response.json()["error"]["code"] == "catalog.invalid_query"
