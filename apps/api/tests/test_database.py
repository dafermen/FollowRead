from pathlib import Path

from sqlalchemy import text

from followread_api.database import (
    check_database,
    create_database_engine,
    create_session_factory,
    get_database_engine,
    get_database_session,
    resolve_sqlite_url,
)


def test_sqlite_file_is_created_and_supports_transactions(tmp_path: Path) -> None:
    database_path = tmp_path / "nested" / "followread.db"
    engine = create_database_engine(f"sqlite:///{database_path.as_posix()}")

    assert check_database(engine)
    assert database_path.exists()

    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE sample (id INTEGER PRIMARY KEY)"))

    connection = engine.connect()
    transaction = connection.begin()
    connection.execute(text("INSERT INTO sample (id) VALUES (1)"))
    transaction.rollback()
    connection.close()

    with engine.connect() as verification:
        assert verification.execute(text("SELECT COUNT(*) FROM sample")).scalar_one() == 0

    engine.dispose()


def test_session_factory_and_dependency_close_sessions() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    session = create_session_factory(engine)()
    assert session.execute(text("SELECT 1")).scalar_one() == 1
    session.close()

    get_database_engine.cache_clear()
    dependency = get_database_session()
    dependency_session = next(dependency)
    assert dependency_session.execute(text("SELECT 1")).scalar_one() == 1
    dependency.close()
    get_database_engine().dispose()
    get_database_engine.cache_clear()


def test_non_sqlite_url_is_rejected() -> None:
    try:
        create_database_engine("postgresql://localhost/followread")
    except ValueError as error:
        assert str(error) == "FollowRead MVP requires a SQLite database URL."
    else:
        raise AssertionError("Non-SQLite URL was accepted.")


def test_relative_sqlite_url_is_resolved_under_repository_root() -> None:
    url = resolve_sqlite_url("sqlite:///./var/test-relative.db")

    assert url.database is not None
    assert Path(url.database).is_absolute()
    assert url.database.replace("\\", "/").endswith("/var/test-relative.db")
