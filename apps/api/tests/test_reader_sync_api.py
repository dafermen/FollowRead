import asyncio
from collections.abc import Generator
from hashlib import sha256
from pathlib import Path
from typing import Any
from uuid import uuid4

from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine, select
from sqlalchemy.orm import Session

from followread_api.cli.seed_demo_story import STORY_SLUG, seed_demo_story
from followread_api.database import (
    create_database_engine,
    create_session_factory,
    get_database_session,
)
from followread_api.main import create_app
from followread_api.models import Base, ReadingProgress, User


def build_reader_client(tmp_path: Path) -> tuple[AsyncClient, Engine]:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    cover = tmp_path / "cover.png"
    cover.write_bytes(b"cover")
    with session_factory() as session:
        seed_demo_story(session, cover_path=cover, audio_output_dir=tmp_path / "audio")

    def override_session() -> Generator[Session, None, None]:
        with session_factory() as session:
            yield session

    application = create_app()
    application.dependency_overrides[get_database_session] = override_session
    return (
        AsyncClient(transport=ASGITransport(app=application), base_url="http://test"),
        engine,
    )


def test_package_checksum_matches_the_exact_response(tmp_path: Path) -> None:
    async def exercise() -> None:
        client, engine = build_reader_client(tmp_path)
        try:
            async with client:
                catalog = await client.get("/catalog")
                package = await client.get(f"/catalog/{STORY_SLUG}/reader-package")
                expected = catalog.json()["items"][0]["checksum"]
                observed = f"sha256:{sha256(package.content).hexdigest()}"
                assert package.status_code == 200
                assert package.headers["etag"] == '"1"'
                assert observed == expected
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_progress_sync_is_idempotent_non_regressive_and_non_identifying(tmp_path: Path) -> None:
    async def exercise() -> None:
        client, engine = build_reader_client(tmp_path)
        client_id = uuid4()
        operation_id = uuid4()
        request: dict[str, Any] = {
            "client_id": str(client_id),
            "operations": [
                {
                    "operation_id": str(operation_id),
                    "slug": STORY_SLUG,
                    "version": 1,
                    "stable_anchor": "paragraph-2",
                    "position_ms": 5000,
                    "occurred_at": "2026-07-26T12:00:00Z",
                },
            ],
        }
        try:
            async with client:
                first = await client.post("/reader/sync", json=request)
                repeated = await client.post("/reader/sync", json=request)
                regressive = await client.post(
                    "/reader/sync",
                    json={
                        **request,
                        "operations": [
                            {
                                **request["operations"][0],
                                "operation_id": str(uuid4()),
                                "position_ms": 1000,
                            },
                        ],
                    },
                )
                invalid = await client.post(
                    "/reader/sync",
                    json={
                        **request,
                        "operations": [
                            {
                                **request["operations"][0],
                                "operation_id": str(uuid4()),
                                "stable_anchor": "missing",
                            },
                            {
                                **request["operations"][0],
                                "operation_id": str(uuid4()),
                                "slug": "missing-story",
                            },
                        ],
                    },
                )

            assert first.status_code == 200
            assert first.json()["confirmed"][0]["applied"] is True
            assert repeated.json()["confirmed"][0]["applied"] is False
            assert regressive.json()["confirmed"][0]["position_ms"] == 5000
            assert regressive.json()["confirmed"][0]["applied"] is False
            assert {item["reason"] for item in invalid.json()["rejected"]} == {
                "anchor_unavailable",
                "content_unavailable",
            }
            with Session(engine) as session:
                users = session.scalars(select(User)).all()
                progress = session.scalars(select(ReadingProgress)).all()
                assert len(users) == 1
                assert users[0].email_normalized is None
                assert users[0].external_subject == f"reader-device:{client_id}"
                assert len(progress) == 1
                assert progress[0].position_ms == 5000
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_progress_sync_validates_bounded_operations(tmp_path: Path) -> None:
    async def exercise() -> None:
        client, engine = build_reader_client(tmp_path)
        try:
            async with client:
                response = await client.post(
                    "/reader/sync",
                    json={"client_id": str(uuid4()), "operations": []},
                )
            assert response.status_code == 422
        finally:
            engine.dispose()

    asyncio.run(exercise())
