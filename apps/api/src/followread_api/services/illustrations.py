from base64 import b64decode
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    AuditLog,
    Chapter,
    ContentTranslation,
    ContentVersion,
    Illustration,
    ReadingContent,
    ResourceStatus,
)
from followread_api.services.errors import ContentNotFoundError, InvalidCatalogQueryError

IMAGE_SIGNATURES = {
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
    "image/webp": b"RIFF",
}
IMAGE_EXTENSIONS = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}
MAXIMUM_IMAGE_BYTES = 5 * 1024 * 1024


@dataclass(frozen=True)
class IllustrationResource:
    id: UUID
    content_version_id: UUID
    paragraph_id: UUID | None
    position: int
    uri: str
    checksum: str
    alt_text: str
    status: ResourceStatus


class IllustrationService:
    def __init__(self, session: Session, storage_root: str | Path) -> None:
        self._session = session
        self._storage_root = Path(storage_root)

    def upload(
        self,
        content_id: UUID,
        *,
        content_type: str,
        payload_base64: str,
        alt_text: str,
        position: int,
        paragraph_id: UUID | None,
        actor_user_id: UUID,
        correlation_id: str,
    ) -> IllustrationResource:
        signature = IMAGE_SIGNATURES.get(content_type)
        clean_alt = alt_text.strip()
        if signature is None:
            raise InvalidCatalogQueryError("content_type", "Use PNG, JPEG or WebP.")
        if not clean_alt:
            raise InvalidCatalogQueryError("alt_text", "Alternative text is required.")
        try:
            payload = b64decode(payload_base64, validate=True)
        except ValueError as error:
            raise InvalidCatalogQueryError("payload", "The image encoding is invalid.") from error
        if not payload.startswith(signature) or (
            content_type == "image/webp" and payload[8:12] != b"WEBP"
        ):
            raise InvalidCatalogQueryError("payload", "The file signature does not match its type.")
        if len(payload) > MAXIMUM_IMAGE_BYTES:
            raise InvalidCatalogQueryError("payload", "The image exceeds the 5 MB limit.")

        content = self._session.scalar(
            select(ReadingContent)
            .where(ReadingContent.id == content_id)
            .options(
                selectinload(ReadingContent.versions)
                .selectinload(ContentVersion.translations)
                .selectinload(ContentTranslation.chapters)
                .selectinload(Chapter.paragraphs),
            ),
        )
        if content is None or not content.versions:
            raise ContentNotFoundError(str(content_id))
        version = max(content.versions, key=lambda item: item.version_number)
        paragraph_ids = {
            paragraph.id
            for translation in version.translations
            for chapter in translation.chapters
            for paragraph in chapter.paragraphs
        }
        if paragraph_id is not None and paragraph_id not in paragraph_ids:
            raise InvalidCatalogQueryError("paragraph_id", "Paragraph is outside this version.")

        digest = sha256(payload).hexdigest()
        self._storage_root.mkdir(parents=True, exist_ok=True)
        extension = IMAGE_EXTENSIONS[content_type]
        target = self._storage_root / f"{version.id}-{position}-{digest[:12]}{extension}"
        target.write_bytes(payload)
        illustration = self._session.scalar(
            select(Illustration).where(
                Illustration.content_version_id == version.id,
                Illustration.position == position,
            ),
        )
        if illustration is None:
            illustration = Illustration(content_version_id=version.id, position=position)
            self._session.add(illustration)
        illustration.paragraph_id = paragraph_id
        illustration.uri = target.as_posix()
        illustration.checksum = f"sha256:{digest}"
        illustration.alt_text = clean_alt
        illustration.status = ResourceStatus.READY
        self._session.flush()
        self._session.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action="illustration.uploaded",
                target_type="illustration",
                target_id=illustration.id,
                outcome="succeeded",
                correlation_id=correlation_id,
                event_metadata={"content_id": str(content.id), "position": position},
            ),
        )
        self._session.commit()
        return IllustrationResource(
            id=illustration.id,
            content_version_id=version.id,
            paragraph_id=illustration.paragraph_id,
            position=illustration.position,
            uri=illustration.uri,
            checksum=illustration.checksum,
            alt_text=clean_alt,
            status=illustration.status,
        )
