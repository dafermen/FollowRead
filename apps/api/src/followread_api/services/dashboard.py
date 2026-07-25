from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    AuditLog,
    ContentVersion,
    EditorialStatus,
    JobStatus,
    Language,
    ProcessingJob,
    ReadingContent,
)


@dataclass(frozen=True)
class DashboardMetrics:
    total: int
    drafts: int
    in_review: int
    published: int


@dataclass(frozen=True)
class DashboardAttention:
    reviews: int
    failed_jobs: int


@dataclass(frozen=True)
class DashboardRecentContent:
    id: UUID
    title: str
    content_type: str
    audience: str
    languages: tuple[Language, ...]
    version: int
    status: EditorialStatus
    updated_at: datetime


@dataclass(frozen=True)
class DashboardActivity:
    action: str
    target_type: str
    outcome: str
    occurred_at: datetime


@dataclass(frozen=True)
class DashboardSummary:
    metrics: DashboardMetrics
    attention: DashboardAttention
    recent_content: tuple[DashboardRecentContent, ...]
    activity: tuple[DashboardActivity, ...]


class DashboardService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_summary(self) -> DashboardSummary:
        contents = self._session.scalars(
            select(ReadingContent).options(
                selectinload(ReadingContent.versions).selectinload(ContentVersion.translations),
            ),
        ).all()
        latest_versions = [
            (content, max(content.versions, key=lambda version: version.version_number))
            for content in contents
            if content.versions
        ]
        draft_statuses = {
            EditorialStatus.DRAFT,
            EditorialStatus.READY_FOR_PROCESSING,
            EditorialStatus.PROCESSING_FAILED,
            EditorialStatus.REVIEW_REJECTED,
        }
        review_statuses = {
            EditorialStatus.READY_FOR_REVIEW,
            EditorialStatus.APPROVED,
        }
        failed_jobs = self._session.scalar(
            select(func.count())
            .select_from(ProcessingJob)
            .where(ProcessingJob.status == JobStatus.FAILED),
        )
        audit_events = self._session.scalars(
            select(AuditLog).order_by(AuditLog.created_at.desc()).limit(3),
        ).all()

        return DashboardSummary(
            metrics=DashboardMetrics(
                total=len(contents),
                drafts=sum(version.status in draft_statuses for _, version in latest_versions),
                in_review=sum(version.status in review_statuses for _, version in latest_versions),
                published=sum(
                    version.status == EditorialStatus.PUBLISHED for _, version in latest_versions
                ),
            ),
            attention=DashboardAttention(
                reviews=sum(
                    version.status == EditorialStatus.READY_FOR_REVIEW
                    for _, version in latest_versions
                ),
                failed_jobs=failed_jobs or 0,
            ),
            recent_content=tuple(
                self._recent_content(content, version)
                for content, version in sorted(
                    latest_versions,
                    key=lambda item: item[1].updated_at,
                    reverse=True,
                )[:3]
            ),
            activity=tuple(
                DashboardActivity(
                    action=event.action,
                    target_type=event.target_type,
                    outcome=event.outcome,
                    occurred_at=event.created_at,
                )
                for event in audit_events
            ),
        )

    @staticmethod
    def _recent_content(
        content: ReadingContent,
        version: ContentVersion,
    ) -> DashboardRecentContent:
        translations = sorted(
            version.translations,
            key=lambda translation: (
                translation.language != Language.SPANISH,
                translation.language.value,
            ),
        )
        title = translations[0].title if translations else content.slug.replace("-", " ").title()
        return DashboardRecentContent(
            id=content.id,
            title=title,
            content_type=content.content_type.value,
            audience=content.audience.value,
            languages=tuple(
                sorted(
                    (translation.language for translation in version.translations),
                    key=lambda language: language.value,
                ),
            ),
            version=version.version_number,
            status=version.status,
            updated_at=version.updated_at,
        )
