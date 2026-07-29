from pathlib import Path

from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, inspect, text


def migration_config(database_path: Path) -> Config:
    api_root = Path(__file__).resolve().parents[1]
    config = Config(api_root / "alembic.ini")
    config.set_main_option("script_location", str(api_root / "migrations"))
    config.attributes["database_url"] = f"sqlite:///{database_path.as_posix()}"
    return config


def test_functional_migration_upgrades_downgrades_and_upgrades(tmp_path: Path) -> None:
    database_path = tmp_path / "migration.db"
    config = migration_config(database_path)

    command.upgrade(config, "head")
    engine = create_engine(f"sqlite:///{database_path.as_posix()}")

    inspector = inspect(engine)
    expected_tables = {
        "administrators",
        "alembic_version",
        "audio_assets",
        "audit_logs",
        "categories",
        "chapters",
        "content_translations",
        "content_versions",
        "download_records",
        "favorites",
        "illustrations",
        "paragraphs",
        "permissions",
        "processing_jobs",
        "publications",
        "reading_contents",
        "reading_levels",
        "reading_progress",
        "roles",
        "speech_marks",
        "users",
        "user_credentials",
        "user_sessions",
        "vocabulary_words",
    }
    assert expected_tables <= set(inspector.get_table_names())
    progress_foreign_keys = {
        foreign_key["referred_table"]
        for foreign_key in inspector.get_foreign_keys("reading_progress")
    }
    assert progress_foreign_keys == {"users", "reading_contents", "content_versions"}
    with engine.connect() as connection:
        assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == (
            "20260729_0003"
        )

    command.downgrade(config, "base")
    with engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM alembic_version")).scalar_one() == 0

    command.upgrade(config, "head")
    assert ScriptDirectory.from_config(config).get_heads() == ["20260729_0003"]
    engine.dispose()
