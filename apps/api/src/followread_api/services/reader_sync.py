from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.models import ReadingProgress, User
from followread_api.repositories import PublishedCatalogRepository


@dataclass(frozen=True)
class ProgressOperation:
    operation_id: UUID
    slug: str
    version: int
    stable_anchor: str
    position_ms: int
    occurred_at: datetime


@dataclass(frozen=True)
class ProgressConfirmation:
    operation_id: UUID
    slug: str
    version: int
    stable_anchor: str
    position_ms: int
    applied: bool


@dataclass(frozen=True)
class ProgressRejection:
    operation_id: UUID
    slug: str
    reason: str


@dataclass(frozen=True)
class ReaderSyncResult:
    confirmed: tuple[ProgressConfirmation, ...]
    rejected: tuple[ProgressRejection, ...]


class ReaderSyncService:
    """Synchronize non-identifying local progress with idempotent operation IDs."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def synchronize(
        self,
        client_id: UUID,
        operations: tuple[ProgressOperation, ...],
    ) -> ReaderSyncResult:
        user = self._device_user(client_id)
        confirmed: list[ProgressConfirmation] = []
        rejected: list[ProgressRejection] = []
        catalog = PublishedCatalogRepository(self._session)

        for operation in operations:
            repeated = self._session.scalar(
                select(ReadingProgress).where(
                    ReadingProgress.last_operation_id == str(operation.operation_id),
                ),
            )
            if repeated is not None:
                confirmed.append(self._confirmation(operation, repeated, applied=False))
                continue

            content = catalog.get_by_slug(operation.slug)
            if content is None or content.publication is None:
                rejected.append(
                    ProgressRejection(
                        operation.operation_id, operation.slug, "content_unavailable"
                    ),
                )
                continue
            version = content.publication.version
            anchors = {
                paragraph.stable_key
                for translation in version.translations
                for chapter in translation.chapters
                for paragraph in chapter.paragraphs
            }
            if operation.stable_anchor not in anchors:
                rejected.append(
                    ProgressRejection(operation.operation_id, operation.slug, "anchor_unavailable"),
                )
                continue

            progress = self._session.scalar(
                select(ReadingProgress).where(
                    ReadingProgress.user_id == user.id,
                    ReadingProgress.reading_content_id == content.id,
                ),
            )
            applied = progress is None or operation.position_ms >= progress.position_ms
            if progress is None:
                progress = ReadingProgress(
                    user=user,
                    content=content,
                    version=version,
                    stable_anchor=operation.stable_anchor,
                    position_ms=operation.position_ms,
                    last_operation_id=str(operation.operation_id),
                )
                self._session.add(progress)
            elif applied:
                progress.version = version
                progress.stable_anchor = operation.stable_anchor
                progress.position_ms = operation.position_ms
                progress.last_operation_id = str(operation.operation_id)
            confirmed.append(self._confirmation(operation, progress, applied=applied))

        self._session.commit()
        return ReaderSyncResult(tuple(confirmed), tuple(rejected))

    def _device_user(self, client_id: UUID) -> User:
        subject = f"reader-device:{client_id}"
        user = self._session.scalar(select(User).where(User.external_subject == subject))
        if user is None:
            user = User(external_subject=subject, status="active")
            self._session.add(user)
            self._session.flush()
        return user

    @staticmethod
    def _confirmation(
        operation: ProgressOperation,
        progress: ReadingProgress,
        *,
        applied: bool,
    ) -> ProgressConfirmation:
        return ProgressConfirmation(
            operation_id=operation.operation_id,
            slug=operation.slug,
            version=progress.version.version_number,
            stable_anchor=progress.stable_anchor,
            position_ms=progress.position_ms,
            applied=applied,
        )
