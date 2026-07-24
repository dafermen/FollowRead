from datetime import UTC

from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from followread_api.models import (
    Audience,
    Base,
    ContentType,
    DownloadStatus,
    EditorialStatus,
    JobStatus,
    Language,
    ReadingLevelCode,
    ResourceStatus,
    TimestampMixin,
    UuidPrimaryKeyMixin,
    utc_now,
)


class FoundationExample(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "foundation_examples"

    name: Mapped[str] = mapped_column(String(40), nullable=False)


def test_domain_enums_expose_only_documented_values() -> None:
    assert [value.value for value in ContentType] == ["story", "article", "book", "lesson"]
    assert [value.value for value in Audience] == ["children", "teenager", "adult", "all"]
    assert [value.value for value in Language] == ["en", "es"]
    assert [value.value for value in ReadingLevelCode] == [
        "beginner",
        "elementary",
        "intermediate",
        "upper-intermediate",
        "advanced",
    ]
    assert EditorialStatus.PUBLISHED.value == "published"
    assert JobStatus.FAILED.value == "failed"
    assert ResourceStatus.INVALID.value == "invalid"
    assert DownloadStatus.VERIFIED.value == "verified"


def test_model_mixins_generate_uuid_and_utc_timestamps() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        model = FoundationExample(name="example")
        session.add(model)
        session.commit()
        session.refresh(model)

        assert model.id is not None
        assert model.created_at is not None
        assert model.updated_at is not None
        assert session.scalar(select(FoundationExample).where(FoundationExample.id == model.id))

    assert utc_now().tzinfo is UTC
    engine.dispose()
