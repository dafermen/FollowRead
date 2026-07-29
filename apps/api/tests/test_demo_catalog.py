from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.cli.seed_demo_catalog import ADDITIONAL_CONTENT, seed_additional_catalog
from followread_api.database import create_database_engine
from followread_api.models import Base, EditorialStatus, Publication, ReadingContent
from followread_api.services import FakePollyAdapter, ReaderPackageService


def test_additional_demo_catalog_is_bilingual_publishable_and_idempotent(
    tmp_path: Path,
) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    stories_dir = tmp_path / "stories"
    stories_dir.mkdir()
    for spec in ADDITIONAL_CONTENT:
        (stories_dir / spec.cover_filename).write_bytes(f"cover:{spec.slug}".encode())

    with Session(engine) as session:
        contents, created_count = seed_additional_catalog(
            session,
            stories_dir=stories_dir,
            audio_output_dir=tmp_path / "audio",
            adapter=FakePollyAdapter(),
        )
        repeated, repeated_count = seed_additional_catalog(
            session,
            stories_dir=stories_dir,
            audio_output_dir=tmp_path / "audio",
            adapter=FakePollyAdapter(),
        )

        assert created_count == 3
        assert repeated_count == 0
        assert [content.id for content in repeated] == [content.id for content in contents]
        assert (
            session.scalar(select(ReadingContent).where(ReadingContent.slug == "missing")) is None
        )

        for spec in ADDITIONAL_CONTENT:
            package = ReaderPackageService(session).get_package(spec.slug)
            publication = session.scalar(
                select(Publication).where(Publication.reading_content_id == package.content_id),
            )
            assert publication is not None
            assert publication.version.status == EditorialStatus.PUBLISHED
            assert package.cover_uri == spec.cover_uri
            assert [translation.language.value for translation in package.translations] == [
                "en",
                "es",
            ]
            assert all(len(translation.chapters) == 2 for translation in package.translations)
            assert all(translation.audio.marks for translation in package.translations)
            assert all(translation.audio.simulated for translation in package.translations)
    engine.dispose()
