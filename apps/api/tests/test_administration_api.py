import asyncio
from base64 import b64encode
from collections.abc import Generator
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import Depends
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine, select
from sqlalchemy.orm import Session

from followread_api.api.dependencies import get_processing_service
from followread_api.database import (
    create_database_engine,
    create_session_factory,
    get_database_session,
)
from followread_api.main import create_app
from followread_api.models import (
    Administrator,
    AuditLog,
    Base,
    ReadingContent,
    Role,
    User,
    UserCredential,
    UserSession,
)
from followread_api.security import PasswordService
from followread_api.services import FakePollyAdapter, PollyProcessingService, bootstrap_superadmin

PASSWORD = "a sufficiently long password"
TRUSTED_ORIGIN = "http://localhost:5173"


class TestAudioStorage:
    def store(self, filename: str, payload: bytes) -> str:
        del payload
        return f"memory://{filename}"


def build_admin_client() -> tuple[AsyncClient, Engine]:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    with session_factory() as session:
        bootstrap_superadmin(
            session,
            email="admin@example.com",
            display_name="Owner",
            password=PASSWORD,
        )
        session.commit()

    def override_session() -> Generator[Session, None, None]:
        with session_factory() as session:
            yield session

    def override_processing_service(
        session: Annotated[Session, Depends(get_database_session)],
    ) -> PollyProcessingService:
        return PollyProcessingService(
            session,
            adapter=FakePollyAdapter(),
            storage=TestAudioStorage(),
            chunk_characters=1500,
            maximum_cost=Decimal("1"),
        )

    application = create_app()
    application.dependency_overrides[get_database_session] = override_session
    application.dependency_overrides[get_processing_service] = override_processing_service
    return (
        AsyncClient(
            transport=ASGITransport(app=application),
            base_url="http://test",
        ),
        engine,
    )


async def login(client: AsyncClient, email: str) -> None:
    response = await client.post(
        "/auth/login",
        json={"email": email, "password": PASSWORD},
        headers={"Origin": TRUSTED_ORIGIN},
    )
    assert response.status_code == 200


def test_admin_access_requires_active_session_and_explicit_permission() -> None:
    async def exercise() -> None:
        client, engine = build_admin_client()
        try:
            async with client:
                unauthenticated = await client.get("/admin/access")
                assert unauthenticated.status_code == 401

                await login(client, "admin@example.com")
                allowed = await client.get("/admin/access")
                assert allowed.status_code == 200
                assert allowed.json()["roles"] == ["super_admin"]
                client.cookies.clear()

                with Session(engine) as session:
                    reader_role = session.scalar(select(Role).where(Role.name == "reader"))
                    assert reader_role is not None
                    session.add(
                        User(
                            email_normalized="reader@example.com",
                            administrator=Administrator(display_name="Adult Reader"),
                            credential=UserCredential(
                                password_hash=PasswordService().hash(PASSWORD),
                                password_changed_at=datetime.now(UTC),
                            ),
                            roles=[reader_role],
                        ),
                    )
                    session.commit()

                await login(client, "reader@example.com")
                denied = await client.get("/admin/access")
                assert denied.status_code == 403
                assert denied.json()["error"]["code"] == "auth.permission_denied"

                with Session(engine) as session:
                    reader = session.scalar(
                        select(User).where(User.email_normalized == "reader@example.com"),
                    )
                    assert reader is not None
                    reader.status = "disabled"
                    session.commit()
                inactive = await client.get("/admin/access")
                assert inactive.status_code == 401
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_admin_access_rejects_a_revoked_session() -> None:
    async def exercise() -> None:
        client, engine = build_admin_client()
        try:
            async with client:
                await login(client, "admin@example.com")
                with Session(engine) as session:
                    stored_session = session.scalar(select(UserSession))
                    assert stored_session is not None
                    stored_session.revoked_at = datetime.now(UTC)
                    stored_session.revocation_reason = "security"
                    session.commit()

                rejected = await client.get("/admin/access")
                assert rejected.status_code == 401
                assert rejected.json()["error"]["code"] == "auth.authentication_required"
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_admin_dashboard_requires_access_and_returns_an_empty_summary() -> None:
    async def exercise() -> None:
        client, engine = build_admin_client()
        try:
            async with client:
                unauthenticated = await client.get("/admin/dashboard")
                assert unauthenticated.status_code == 401

                await login(client, "admin@example.com")
                response = await client.get("/admin/dashboard")
                assert response.status_code == 200
                assert response.json()["metrics"] == {
                    "total": 0,
                    "drafts": 0,
                    "in_review": 0,
                    "published": 0,
                }
                assert response.json()["attention"] == {"reviews": 0, "failed_jobs": 0}
                assert response.json()["recent_content"] == []
                assert response.json()["activity"][0]["action"] == "auth.login"
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_admin_content_requires_access_and_validates_pagination() -> None:
    async def exercise() -> None:
        client, engine = build_admin_client()
        try:
            async with client:
                unauthenticated = await client.get("/admin/content")
                assert unauthenticated.status_code == 401

                await login(client, "admin@example.com")
                response = await client.get(
                    "/admin/content",
                    params={
                        "search": "story",
                        "status": "draft",
                        "content_type": "story",
                        "sort": "title",
                        "limit": 5,
                        "offset": 0,
                    },
                )
                assert response.status_code == 200
                assert response.json() == {
                    "items": [],
                    "total": 0,
                    "limit": 5,
                    "offset": 0,
                }

                invalid = await client.get("/admin/content", params={"limit": 0})
                assert invalid.status_code == 422
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_admin_can_create_audited_drafts_with_csrf_and_reject_duplicates() -> None:
    async def exercise() -> None:
        client, engine = build_admin_client()
        body = {
            "slug": "forest-adventure",
            "title": "Aventura en el bosque",
            "content_type": "story",
            "audience": "children",
            "reading_level": "beginner",
            "languages": ["es", "en"],
            "categories": ["adventure", "nature"],
        }
        try:
            async with client:
                unauthenticated = await client.post("/admin/content", json=body)
                assert unauthenticated.status_code == 401

                await login(client, "admin@example.com")
                csrf_token = client.cookies.get("followread_csrf")
                assert csrf_token is not None

                untrusted = await client.post(
                    "/admin/content",
                    json=body,
                    headers={"Origin": "https://attacker.example", "X-CSRF-Token": csrf_token},
                )
                assert untrusted.status_code == 403
                missing_csrf = await client.post(
                    "/admin/content",
                    json=body,
                    headers={"Origin": TRUSTED_ORIGIN},
                )
                assert missing_csrf.status_code == 403
                wrong_csrf = await client.post(
                    "/admin/content",
                    json=body,
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": "wrong"},
                )
                assert wrong_csrf.status_code == 403

                created = await client.post(
                    "/admin/content",
                    json=body,
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert created.status_code == 201
                assert created.json()["status"] == "draft"
                assert created.json()["actions"] == ["view", "edit", "process"]
                content_id = created.json()["id"]
                editor = await client.get(f"/admin/content/{content_id}/editor")
                assert editor.status_code == 200
                assert editor.json()["translations"][0]["chapters"] == []
                original_updated_at = editor.json()["updated_at"]

                saved = await client.put(
                    f"/admin/content/{content_id}/editor",
                    json={
                        "expected_updated_at": original_updated_at,
                        "translations": [
                            {
                                "language": "es",
                                "title": "Aventura en el bosque",
                                "summary": "Una aventura accesible.",
                                "chapters": [
                                    {
                                        "stable_key": "chapter-1",
                                        "position": 0,
                                        "title": "El sendero",
                                        "paragraphs": [
                                            {
                                                "stable_key": "paragraph-1",
                                                "position": 0,
                                                "text": "Luna entró al bosque.",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert saved.status_code == 200
                assert saved.json()["translations"][0]["chapters"][0]["title"] == "El sendero"
                stale = await client.put(
                    f"/admin/content/{content_id}/editor",
                    json={
                        "expected_updated_at": original_updated_at,
                        "translations": saved.json()["translations"],
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert stale.status_code == 409
                assert stale.json()["error"]["code"] == "editor.conflict"

                image_body = {
                    "content_type": "image/png",
                    "payload_base64": b64encode(b"\x89PNG\r\n\x1a\n").decode(),
                    "alt_text": "Luna camina entre árboles verdes.",
                    "position": 0,
                }
                invalid_image_type = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={**image_body, "content_type": "text/plain"},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_image_type.status_code == 422
                invalid_image_encoding = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={**image_body, "payload_base64": "not-base64"},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_image_encoding.status_code == 422
                missing_alt_text = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={**image_body, "alt_text": "   "},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert missing_alt_text.status_code == 422
                invalid_signature = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={**image_body, "payload_base64": b64encode(b"not-png").decode()},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_signature.status_code == 422
                invalid_webp_signature = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={
                        **image_body,
                        "content_type": "image/webp",
                        "payload_base64": b64encode(b"RIFFxxxxNOPE").decode(),
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_webp_signature.status_code == 422
                oversized_image = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={
                        **image_body,
                        "payload_base64": b64encode(
                            b"\x89PNG\r\n\x1a\n" + b"x" * (5 * 1024 * 1024),
                        ).decode(),
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert oversized_image.status_code == 422
                invalid_paragraph = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={**image_body, "paragraph_id": "00000000-0000-0000-0000-000000000000"},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_paragraph.status_code == 422
                illustration = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json=image_body,
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert illustration.status_code == 201
                assert illustration.json()["status"] == "ready"
                replaced_illustration = await client.post(
                    f"/admin/content/{content_id}/illustrations",
                    json={**image_body, "alt_text": "Descripción actualizada."},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert replaced_illustration.json()["id"] == illustration.json()["id"]

                voices = await client.get("/admin/voices")
                assert voices.status_code == 200
                assert {item["id"] for item in voices.json()["items"]} == {
                    "Lucia",
                    "Sergio",
                    "Joanna",
                    "Matthew",
                    "marin",
                    "coral",
                    "cedar",
                    "verse",
                }
                empty_jobs = await client.get("/admin/processing")
                assert empty_jobs.status_code == 200
                assert empty_jobs.json()["items"] == []
                processing = await client.post(
                    "/admin/processing",
                    json={
                        "content_version_id": saved.json()["content_version_id"],
                        "language": "es",
                        "voice_id": "Lucia",
                        "idempotency_key": "forest-adventure-es-v1",
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert processing.status_code == 202
                assert processing.json()["status"] == "succeeded"
                repeated_processing = await client.post(
                    "/admin/processing",
                    json={
                        "content_version_id": saved.json()["content_version_id"],
                        "language": "es",
                        "voice_id": "Lucia",
                        "idempotency_key": "forest-adventure-es-v1",
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert repeated_processing.json()["id"] == processing.json()["id"]
                jobs = await client.get("/admin/processing")
                assert len(jobs.json()["items"]) == 1
                cancelled_completed = await client.post(
                    f"/admin/processing/{processing.json()['id']}/cancel",
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert cancelled_completed.json()["status"] == "succeeded"
                invalid_retry = await client.post(
                    f"/admin/processing/{processing.json()['id']}/retry",
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_retry.status_code == 422

                review = await client.get(f"/admin/content/{content_id}/review")
                assert review.status_code == 200
                assert all(item["passed"] for item in review.json()["checks"])
                submitted = await client.post(
                    f"/admin/content/{content_id}/review/submit",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert submitted.json()["status"] == "ready_for_review"
                missing_rejection_note = await client.post(
                    f"/admin/content/{content_id}/review/reject",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert missing_rejection_note.status_code == 422
                rejected = await client.post(
                    f"/admin/content/{content_id}/review/reject",
                    json={"note": "Ajustar el cierre."},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert rejected.json()["status"] == "review_rejected"
                await client.post(
                    f"/admin/content/{content_id}/review/submit",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                approved = await client.post(
                    f"/admin/content/{content_id}/review/approve",
                    json={"note": "Lectura verificada."},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert approved.json()["status"] == "approved"
                published = await client.post(
                    f"/admin/content/{content_id}/review/publish",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert published.json()["status"] == "published"
                unpublished = await client.post(
                    f"/admin/content/{content_id}/review/unpublish",
                    json={"note": "Pausa editorial."},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert unpublished.json()["status"] == "unpublished"
                republished = await client.post(
                    f"/admin/content/{content_id}/review/publish",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert republished.json()["status"] == "published"
                await client.post(
                    f"/admin/content/{content_id}/review/unpublish",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                archived = await client.post(
                    f"/admin/content/{content_id}/review/archive",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert archived.json()["status"] == "archived"
                assert [item["action"] for item in archived.json()["history"]][:2] == [
                    "archive",
                    "unpublish",
                ]
                invalid_transition = await client.post(
                    f"/admin/content/{content_id}/review/publish",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert invalid_transition.status_code == 422

                second = await client.post(
                    "/admin/content",
                    json={
                        **body,
                        "slug": "second-adventure",
                        "title": "Otra aventura",
                        "languages": ["es"],
                    },
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert second.status_code == 201
                incomplete_review = await client.post(
                    f"/admin/content/{second.json()['id']}/review/submit",
                    json={},
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert incomplete_review.status_code == 422
                duplicate = await client.post(
                    "/admin/content",
                    json=body,
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert duplicate.status_code == 422
                assert duplicate.json()["error"]["details"]["slug"]

                missing_editor = await client.get(
                    "/admin/content/00000000-0000-0000-0000-000000000000/editor",
                )
                assert missing_editor.status_code == 404
                missing_review = await client.get(
                    "/admin/content/00000000-0000-0000-0000-000000000000/review",
                )
                assert missing_review.status_code == 404
                missing_illustration_content = await client.post(
                    "/admin/content/00000000-0000-0000-0000-000000000000/illustrations",
                    json=image_body,
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert missing_illustration_content.status_code == 404

                with Session(engine) as session:
                    assert len(session.scalars(select(ReadingContent)).all()) == 2
                    audit = session.scalar(
                        select(AuditLog).where(AuditLog.action == "content.created"),
                    )
                    assert audit is not None
                    assert audit.event_metadata == {"slug": "forest-adventure"}
        finally:
            engine.dispose()

    asyncio.run(exercise())
