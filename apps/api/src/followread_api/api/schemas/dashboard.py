from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from followread_api.models import EditorialStatus, Language
from followread_api.services.dashboard import DashboardSummary


class DashboardMetricsResponse(BaseModel):
    total: int
    drafts: int
    in_review: int
    published: int


class DashboardAttentionResponse(BaseModel):
    reviews: int
    failed_jobs: int


class DashboardRecentContentResponse(BaseModel):
    id: UUID
    title: str
    content_type: str
    audience: str
    languages: list[Language]
    version: int
    status: EditorialStatus
    updated_at: datetime


class DashboardActivityResponse(BaseModel):
    action: str
    target_type: str
    outcome: str
    occurred_at: datetime


class DashboardSummaryResponse(BaseModel):
    metrics: DashboardMetricsResponse
    attention: DashboardAttentionResponse
    recent_content: list[DashboardRecentContentResponse]
    activity: list[DashboardActivityResponse]


def dashboard_summary_response(summary: DashboardSummary) -> DashboardSummaryResponse:
    return DashboardSummaryResponse(
        metrics=DashboardMetricsResponse(
            total=summary.metrics.total,
            drafts=summary.metrics.drafts,
            in_review=summary.metrics.in_review,
            published=summary.metrics.published,
        ),
        attention=DashboardAttentionResponse(
            reviews=summary.attention.reviews,
            failed_jobs=summary.attention.failed_jobs,
        ),
        recent_content=[
            DashboardRecentContentResponse(
                id=item.id,
                title=item.title,
                content_type=item.content_type,
                audience=item.audience,
                languages=list(item.languages),
                version=item.version,
                status=item.status,
                updated_at=item.updated_at,
            )
            for item in summary.recent_content
        ],
        activity=[
            DashboardActivityResponse(
                action=item.action,
                target_type=item.target_type,
                outcome=item.outcome,
                occurred_at=item.occurred_at,
            )
            for item in summary.activity
        ],
    )
