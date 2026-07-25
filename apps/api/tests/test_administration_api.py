import asyncio
from collections.abc import Generator
from datetime import UTC, datetime

from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine, select
from sqlalchemy.orm import Session

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
from followread_api.services import bootstrap_superadmin

PASSWORD = "a sufficiently long password"
TRUSTED_ORIGIN = "http://localhost:5173"


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

    application = create_app()
    application.dependency_overrides[get_database_session] = override_session
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
