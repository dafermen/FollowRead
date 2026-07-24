from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import (
    Audience,
    AudioAsset,
    Base,
    ContentType,
    ContentVersion,
    Illustration,
    JobStatus,
    Language,
    ProcessingJob,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
    ResourceStatus,
    SpeechMark,
)


def create_version(session: Session) -> ContentVersion:
    level = ReadingLevel(
        code=ReadingLevelCode.BEGINNER,
        label="Beginner",
        display_order=0,
    )
    content = ReadingContent(
        slug="resource-story",
        content_type=ContentType.STORY,
        audience=Audience.ALL,
        reading_level=level,
    )
    version = ContentVersion(version_number=1)
    content.versions.append(version)
    session.add(content)
    session.flush()
    return version


def test_resources_and_processing_job_belong_to_version() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        version = create_version(session)
        audio = AudioAsset(
            version=version,
            language=Language.ENGLISH,
            voice_id="Joanna",
            uri="/audio/story.mp3",
            checksum="sha256:" + ("b" * 64),
            duration_ms=2000,
            status=ResourceStatus.READY,
        )
        audio.speech_marks.append(
            SpeechMark(
                position=0,
                mark_type="word",
                value="Moon",
                start_ms=0,
                end_ms=400,
                char_start=0,
                char_end=4,
            ),
        )
        illustration = Illustration(
            version=version,
            position=0,
            uri="/images/moon.webp",
            checksum="sha256:" + ("c" * 64),
            alt_text="A bright moon",
            status=ResourceStatus.READY,
        )
        job = ProcessingJob(
            version=version,
            language=Language.ENGLISH,
            job_type="narration",
            idempotency_key="version-1-en-narration",
            status=JobStatus.SUCCEEDED,
            progress_percent=100,
            estimated_cost=Decimal("0.1200"),
        )
        session.add_all([audio, illustration, job])
        session.commit()

        assert audio.speech_marks[0].value == "Moon"
        assert illustration.version.id == version.id
        assert job.status is JobStatus.SUCCEEDED

    engine.dispose()


def test_processing_job_idempotency_key_is_unique() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        version = create_version(session)
        session.add_all(
            [
                ProcessingJob(
                    version=version,
                    job_type="narration",
                    idempotency_key="same-key",
                ),
                ProcessingJob(
                    version=version,
                    job_type="narration",
                    idempotency_key="same-key",
                ),
            ],
        )
        with pytest.raises(IntegrityError):
            session.commit()

    engine.dispose()
