from collections.abc import Generator
from functools import lru_cache
from pathlib import Path
from typing import cast

from sqlalchemy import Engine, create_engine, event, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import Session, sessionmaker

from followread_api.config import get_settings

REPOSITORY_ROOT = Path(__file__).resolve().parents[4]


def resolve_sqlite_url(database_url: str) -> URL:
    url = make_url(database_url)
    if url.get_backend_name() != "sqlite":
        raise ValueError("FollowRead MVP requires a SQLite database URL.")

    database_name = url.database
    if database_name in (None, "", ":memory:"):
        return url

    database_path = Path(cast(str, database_name))
    if not database_path.is_absolute():
        database_path = REPOSITORY_ROOT / database_path
    database_path.parent.mkdir(parents=True, exist_ok=True)
    return url.set(database=database_path.resolve().as_posix())


def create_database_engine(database_url: str) -> Engine:
    url = resolve_sqlite_url(database_url)
    engine = create_engine(url, connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection: object, _: object) -> None:
        cursor = dbapi_connection.cursor()  # type: ignore[attr-defined]
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return engine


@lru_cache
def get_database_engine() -> Engine:
    return create_database_engine(str(get_settings().database_url))


def check_database(engine: Engine) -> bool:
    with engine.connect() as connection:
        value = cast(int, connection.execute(text("SELECT 1")).scalar_one())
        return value == 1


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_database_session() -> Generator[Session, None, None]:
    session = create_session_factory(get_database_engine())()
    try:
        yield session
    finally:
        session.close()
