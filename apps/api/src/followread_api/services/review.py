from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    AudioAsset,
    AuditLog,
    Chapter,
    ContentTranslation,
    ContentVersion,
    EditorialStatus,
    Publication,
    ReadingContent,
    ResourceStatus,
)
from followread_api.services.errors import ContentNotFoundError, InvalidCatalogQueryError
from followread_api.services.package_integrity import reader_package_checksum
from followread_api.services.reader_package import ReaderPackageService

ReviewAction = Literal["submit", "approve", "reject", "publish", "unpublish", "archive"]


@dataclass(frozen=True)
class ReviewCheck:
    code: str
    label: str
    passed: bool


@dataclass(frozen=True)
class ReviewEvent:
    action: str
    created_at: datetime
    note: str | None


@dataclass(frozen=True)
class ReviewSnapshot:
    content_id: UUID
    content_version_id: UUID
    title: str
    version: int
    status: EditorialStatus
    checks: tuple[ReviewCheck, ...]
    history: tuple[ReviewEvent, ...]


TRANSITIONS: dict[ReviewAction, tuple[frozenset[EditorialStatus], EditorialStatus]] = {
    "submit": (
        frozenset(
            {
                EditorialStatus.DRAFT,
                EditorialStatus.PROCESSING_FAILED,
                EditorialStatus.REVIEW_REJECTED,
            },
        ),
        EditorialStatus.READY_FOR_REVIEW,
    ),
    "approve": (
        frozenset({EditorialStatus.READY_FOR_REVIEW}),
        EditorialStatus.APPROVED,
    ),
    "reject": (
        frozenset({EditorialStatus.READY_FOR_REVIEW}),
        EditorialStatus.REVIEW_REJECTED,
    ),
    "publish": (
        frozenset({EditorialStatus.APPROVED, EditorialStatus.UNPUBLISHED}),
        EditorialStatus.PUBLISHED,
    ),
    "unpublish": (
        frozenset({EditorialStatus.PUBLISHED}),
        EditorialStatus.UNPUBLISHED,
    ),
    "archive": (
        frozenset(
            {
                EditorialStatus.DRAFT,
                EditorialStatus.REVIEW_REJECTED,
                EditorialStatus.UNPUBLISHED,
            },
        ),
        EditorialStatus.ARCHIVED,
    ),
}


class EditorialReviewService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_snapshot(self, content_id: UUID) -> ReviewSnapshot:
        content, version = self._load(content_id)
        return self._snapshot(content, version)

    def transition(
        self,
        content_id: UUID,
        action: ReviewAction,
        *,
        actor_user_id: UUID,
        correlation_id: str,
        note: str | None = None,
    ) -> ReviewSnapshot:
        content, version = self._load(content_id)
        allowed, target = TRANSITIONS[action]
        if version.status not in allowed:
            raise InvalidCatalogQueryError(
                "status",
                f"The {action} action is not valid from {version.status.value}.",
            )
        checks = self._checks(version)
        if action in {"submit", "approve"} and not all(check.passed for check in checks):
            raise InvalidCatalogQueryError(
                "checklist",
                "Complete text, translation and audio checks before review approval.",
            )
        if action == "reject" and not (note or "").strip():
            raise InvalidCatalogQueryError("note", "A rejection note is required.")

        previous_status = version.status
        version.status = target
        now = datetime.now(UTC)
        if action == "publish":
            publication = content.publication
            if publication is None:
                publication = Publication(
                    content=content,
                    version=version,
                    is_active=True,
                    published_at=now,
                )
                self._session.add(publication)
            else:
                publication.version = version
                publication.is_active = True
                publication.published_at = now
                publication.unpublished_at = None
            version.package_url = f"/catalog/{content.slug}/reader-package"
            version.checksum = version.checksum or f"sha256:{'0' * 64}"
            self._session.flush()
            package = ReaderPackageService(self._session).get_package(content.slug)
            version.checksum = reader_package_checksum(package)
        elif action == "unpublish" and content.publication is not None:
            content.publication.is_active = False
            content.publication.unpublished_at = now

        self._session.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action=f"content.{action}",
                target_type="content",
                target_id=content.id,
                outcome="succeeded",
                correlation_id=correlation_id,
                event_metadata={"from": previous_status.value, "to": target.value, "note": note},
            ),
        )
        self._session.commit()
        return self._snapshot(content, version)

    def _load(self, content_id: UUID) -> tuple[ReadingContent, ContentVersion]:
        content = self._session.scalar(
            select(ReadingContent)
            .where(ReadingContent.id == content_id)
            .options(
                selectinload(ReadingContent.versions)
                .selectinload(ContentVersion.translations)
                .selectinload(ContentTranslation.chapters)
                .selectinload(Chapter.paragraphs),
                selectinload(ReadingContent.publication),
            ),
        )
        if content is None or not content.versions:
            raise ContentNotFoundError(str(content_id))
        return content, max(content.versions, key=lambda item: item.version_number)

    def _snapshot(self, content: ReadingContent, version: ContentVersion) -> ReviewSnapshot:
        history = self._session.scalars(
            select(AuditLog)
            .where(
                AuditLog.target_type == "content",
                AuditLog.target_id == content.id,
                AuditLog.action.in_(
                    [
                        "content.submit",
                        "content.approve",
                        "content.reject",
                        "content.publish",
                        "content.unpublish",
                        "content.archive",
                    ],
                ),
            )
            .order_by(AuditLog.created_at.desc()),
        ).all()
        title = next(
            (translation.title for translation in version.translations if translation.title),
            content.slug,
        )
        return ReviewSnapshot(
            content_id=content.id,
            content_version_id=version.id,
            title=title,
            version=version.version_number,
            status=version.status,
            checks=self._checks(version),
            history=tuple(
                ReviewEvent(
                    action=event.action.removeprefix("content."),
                    created_at=event.created_at,
                    note=(
                        str(event.event_metadata["note"])
                        if event.event_metadata.get("note") is not None
                        else None
                    ),
                )
                for event in history
            ),
        )

    def _checks(self, version: ContentVersion) -> tuple[ReviewCheck, ...]:
        translations = version.translations
        text_ready = bool(translations) and all(
            translation.title.strip()
            and translation.chapters
            and all(chapter.paragraphs for chapter in translation.chapters)
            for translation in translations
        )
        bilingual_aligned = (
            len(translations) < 2
            or len(
                {
                    tuple(chapter.stable_key for chapter in translation.chapters)
                    for translation in translations
                },
            )
            == 1
        )
        ready_audio_languages = set(
            self._session.scalars(
                select(AudioAsset.language).where(
                    AudioAsset.content_version_id == version.id,
                    AudioAsset.status == ResourceStatus.READY,
                ),
            ).all(),
        )
        audio_ready = bool(translations) and all(
            translation.language in ready_audio_languages for translation in translations
        )
        return (
            ReviewCheck("text", "Texto estructurado completo", text_ready),
            ReviewCheck("alignment", "Traducciones alineadas", bilingual_aligned),
            ReviewCheck("audio", "Audio listo por idioma", audio_ready),
        )
