import json
from datetime import UTC, datetime
from decimal import Decimal
from hashlib import sha256
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.database import create_session_factory, get_database_engine
from followread_api.models import (
    Audience,
    Category,
    Chapter,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Illustration,
    JobStatus,
    Language,
    Paragraph,
    Publication,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
    ResourceStatus,
)
from followread_api.services import FakePollyAdapter, LocalAudioStorage, PollyProcessingService

STORY_SLUG = "el-zorro-y-la-luna"
STORY_COVER_URI = "/stories/el-zorro-y-la-luna-cover.png"
STORY_COVER_ALT = (
    "Milo, un pequeño zorro rojo, mira la luna creciente junto a una luciérnaga dorada."
)
STORY = {
    Language.SPANISH: {
        "title": "El zorro y la luna",
        "summary": "Milo y Luma descubren que una luz pequeña puede guiar una gran amistad.",
        "chapters": [
            (
                "chapter-1",
                "Una luz en el bosque",
                [
                    (
                        "paragraph-1",
                        "Milo era un zorro pequeño que miraba la luna cada noche.",
                    ),
                    (
                        "paragraph-2",
                        "Una tarde encontró a Luma, una luciérnaga dorada "
                        "que había perdido su camino.",
                    ),
                    (
                        "paragraph-3",
                        "La luna parecía muy lejos, pero su luz dibujaba "
                        "un sendero plateado entre los árboles.",
                    ),
                ],
            ),
            (
                "chapter-2",
                "El sendero brillante",
                [
                    (
                        "paragraph-4",
                        "Milo caminó despacio y Luma voló a su lado.",
                    ),
                    (
                        "paragraph-5",
                        "Cuando el bosque quedó oscuro, ambos compartieron su pequeña luz.",
                    ),
                    (
                        "paragraph-6",
                        "Al llegar al claro, comprendieron que ninguna luz "
                        "es pequeña cuando ayuda a un amigo.",
                    ),
                ],
            ),
        ],
    },
    Language.ENGLISH: {
        "title": "The Fox and the Moon",
        "summary": "Milo and Luma discover that a small light can guide a great friendship.",
        "chapters": [
            (
                "chapter-1",
                "A Light in the Forest",
                [
                    (
                        "paragraph-1",
                        "Milo was a young fox who watched the moon every night.",
                    ),
                    (
                        "paragraph-2",
                        "One evening he found Luma, a golden firefly who had lost her way.",
                    ),
                    (
                        "paragraph-3",
                        "The moon seemed far away, but its light drew a silver "
                        "path between the trees.",
                    ),
                ],
            ),
            (
                "chapter-2",
                "The Shining Path",
                [
                    (
                        "paragraph-4",
                        "Milo walked slowly, and Luma flew beside him.",
                    ),
                    (
                        "paragraph-5",
                        "When the forest grew dark, they shared their little light.",
                    ),
                    (
                        "paragraph-6",
                        "When they reached the clearing, they understood that no "
                        "light is small when it helps a friend.",
                    ),
                ],
            ),
        ],
    },
}


def seed_demo_story(
    session: Session,
    *,
    cover_path: Path,
    audio_output_dir: Path,
) -> tuple[ReadingContent, bool]:
    existing = session.scalar(select(ReadingContent).where(ReadingContent.slug == STORY_SLUG))
    if existing is not None:
        return existing, False

    level = session.scalar(
        select(ReadingLevel).where(ReadingLevel.code == ReadingLevelCode.BEGINNER),
    )
    if level is None:
        level = ReadingLevel(
            code=ReadingLevelCode.BEGINNER,
            label="Inicial",
            display_order=0,
        )
    category = session.scalar(select(Category).where(Category.slug == "amistad"))
    if category is None:
        category = Category(slug="amistad", name="Amistad")

    version = ContentVersion(
        version_number=1,
        status=EditorialStatus.APPROVED,
        checksum=_story_checksum(),
        package_url=f"/catalog/{STORY_SLUG}/reader-package",
        minimum_app_version="1.0.0",
        translations=[
            ContentTranslation(
                language=language,
                title=str(data["title"]),
                summary=str(data["summary"]),
                chapters=[
                    Chapter(
                        stable_key=chapter_key,
                        position=chapter_position,
                        title=chapter_title,
                        paragraphs=[
                            Paragraph(
                                stable_key=paragraph_key,
                                position=paragraph_position,
                                text=text,
                            )
                            for paragraph_position, (paragraph_key, text) in enumerate(paragraphs)
                        ],
                    )
                    for chapter_position, (chapter_key, chapter_title, paragraphs) in enumerate(
                        data["chapters"],
                    )
                ],
            )
            for language, data in STORY.items()
        ],
    )
    content = ReadingContent(
        slug=STORY_SLUG,
        content_type=ContentType.STORY,
        audience=Audience.CHILDREN,
        reading_level=level,
        categories=[category],
        versions=[version],
    )
    session.add(content)
    session.commit()

    processor = PollyProcessingService(
        session,
        adapter=FakePollyAdapter(),
        storage=LocalAudioStorage(audio_output_dir),
        chunk_characters=1500,
        maximum_cost=Decimal("1.00"),
    )
    for language, voice in (
        (Language.SPANISH, "Lucia"),
        (Language.ENGLISH, "Joanna"),
    ):
        job = processor.process(
            content_version_id=version.id,
            language=language,
            voice_id=voice,
            idempotency_key=f"demo-{STORY_SLUG}-{language.value}-v1",
        )
        if job.status != JobStatus.SUCCEEDED:
            raise RuntimeError(f"Demo audio failed for {language.value}: {job.error_detail}")

    cover_checksum = f"sha256:{sha256(cover_path.read_bytes()).hexdigest()}"
    session.add(
        Illustration(
            content_version_id=version.id,
            position=0,
            uri=STORY_COVER_URI,
            checksum=cover_checksum,
            alt_text=STORY_COVER_ALT,
            status=ResourceStatus.READY,
        ),
    )
    version.status = EditorialStatus.PUBLISHED
    session.add(
        Publication(
            content=content,
            version=version,
            is_active=True,
            published_at=datetime.now(UTC),
        ),
    )
    session.commit()
    return content, True


def _story_checksum() -> str:
    payload = json.dumps(
        {language.value: data for language, data in STORY.items()},
        ensure_ascii=False,
        sort_keys=True,
    ).encode()
    return f"sha256:{sha256(payload).hexdigest()}"


def main() -> int:
    repository_root = Path(__file__).resolve().parents[5]
    cover_path = (
        repository_root / "apps" / "reader" / "public" / "stories" / "el-zorro-y-la-luna-cover.png"
    )
    session_factory = create_session_factory(get_database_engine())
    with session_factory() as session:
        content, created = seed_demo_story(
            session,
            cover_path=cover_path,
            audio_output_dir=repository_root / "var" / "audio",
        )
    state = "created and published" if created else "already exists"
    print(f"Demo story {content.slug} {state}.")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
