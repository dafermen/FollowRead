import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import (
    Audience,
    Base,
    ContentType,
    ContentVersion,
    DownloadRecord,
    DownloadStatus,
    Favorite,
    Language,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
    ReadingProgress,
    User,
    VocabularyWord,
)


def create_user_and_version(session: Session) -> tuple[User, ReadingContent, ContentVersion]:
    user = User(external_subject="reader|1")
    level = ReadingLevel(code=ReadingLevelCode.BEGINNER, label="Beginner", display_order=0)
    content = ReadingContent(
        slug="reader-story",
        content_type=ContentType.STORY,
        audience=Audience.ALL,
        reading_level=level,
    )
    version = ContentVersion(version_number=1)
    content.versions.append(version)
    session.add_all([user, content])
    session.flush()
    return user, content, version


def test_reader_state_preserves_ownership_version_and_idempotency() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user, content, version = create_user_and_version(session)
        session.add_all(
            [
                ReadingProgress(
                    user=user,
                    content=content,
                    version=version,
                    stable_anchor="paragraph-1",
                    position_ms=1250,
                    last_operation_id="progress-op-1",
                ),
                Favorite(user=user, content=content),
                VocabularyWord(
                    user=user,
                    version=version,
                    language=Language.ENGLISH,
                    word="Moon",
                    normalized_word="moon",
                    stable_anchor="paragraph-1:0-4",
                    context="The moon is bright.",
                ),
                DownloadRecord(
                    user=user,
                    version=version,
                    client_id="device-local-1",
                    operation_id="download-op-1",
                    status=DownloadStatus.VERIFIED,
                    checksum="sha256:" + ("d" * 64),
                ),
            ]
        )
        session.commit()

        assert user.id is not None
        assert session.query(ReadingProgress).one().version.id == version.id
        assert session.query(Favorite).one().content.id == content.id
        assert session.query(VocabularyWord).one().normalized_word == "moon"
        assert session.query(DownloadRecord).one().status is DownloadStatus.VERIFIED

    engine.dispose()


def test_favorite_is_unique_per_user_and_content() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user, content, _ = create_user_and_version(session)
        session.add_all(
            [Favorite(user=user, content=content), Favorite(user=user, content=content)]
        )
        with pytest.raises(IntegrityError):
            session.commit()

    engine.dispose()
