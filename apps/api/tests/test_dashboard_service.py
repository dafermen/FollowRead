from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from followread_api.api.schemas import dashboard_summary_response
from followread_api.database import create_database_engine
from followread_api.models import (
    Audience,
    AuditLog,
    Base,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    JobStatus,
    Language,
    ProcessingJob,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
)
from followread_api.services import DashboardService


def test_dashboard_summary_counts_latest_versions_and_recent_activity() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)

    with Session(engine) as session:
        level = ReadingLevel(
            code=ReadingLevelCode.BEGINNER,
            label="Beginner",
            display_order=1,
        )
        draft = _content(
            level,
            "draft-story",
            EditorialStatus.DRAFT,
            now - timedelta(hours=4),
        )
        review = _content(
            level,
            "review-lesson",
            EditorialStatus.READY_FOR_REVIEW,
            now - timedelta(hours=2),
            titles={Language.ENGLISH: "Review lesson", Language.SPANISH: "Lección a revisar"},
        )
        published = _content(
            level,
            "published-article",
            EditorialStatus.PUBLISHED,
            now - timedelta(hours=1),
            titles={Language.SPANISH: "Artículo publicado"},
        )
        failed = _content(
            level,
            "failed-book",
            EditorialStatus.PROCESSING_FAILED,
            now - timedelta(hours=3),
        )
        empty = ReadingContent(
            slug="without-version",
            content_type=ContentType.STORY,
            audience=Audience.ALL,
            reading_level=level,
        )
        session.add_all([draft, review, published, failed, empty])
        session.flush()
        session.add(
            ProcessingJob(
                content_version_id=failed.versions[0].id,
                job_type="audio",
                idempotency_key="failed-job",
                status=JobStatus.FAILED,
                progress_percent=40,
                estimated_cost=Decimal("0.25"),
            ),
        )
        session.add(
            AuditLog(
                action="content.updated",
                target_type="content",
                target_id=review.id,
                outcome="succeeded",
                correlation_id="dashboard-test",
                event_metadata={},
                created_at=now,
                updated_at=now,
            ),
        )
        session.commit()

        summary = DashboardService(session).get_summary()
        response = dashboard_summary_response(summary)

        assert response.metrics.model_dump() == {
            "total": 5,
            "drafts": 2,
            "in_review": 1,
            "published": 1,
        }
        assert response.attention.model_dump() == {"reviews": 1, "failed_jobs": 1}
        assert [item.title for item in response.recent_content] == [
            "Artículo publicado",
            "Lección a revisar",
            "Failed Book",
        ]
        assert response.recent_content[1].languages == [Language.ENGLISH, Language.SPANISH]
        assert response.activity[0].action == "content.updated"
        assert response.activity[0].outcome == "succeeded"

    engine.dispose()


def _content(
    level: ReadingLevel,
    slug: str,
    status: EditorialStatus,
    updated_at: datetime,
    *,
    titles: dict[Language, str] | None = None,
) -> ReadingContent:
    version = ContentVersion(
        version_number=1,
        status=status,
        minimum_app_version="1.0.0",
        updated_at=updated_at,
        translations=[
            ContentTranslation(language=language, title=title)
            for language, title in (titles or {}).items()
        ],
    )
    return ReadingContent(
        slug=slug,
        content_type=ContentType.STORY,
        audience=Audience.ALL,
        reading_level=level,
        versions=[version],
    )
