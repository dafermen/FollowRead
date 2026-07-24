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


def test_baseline_migration_upgrades_downgrades_and_upgrades(tmp_path: Path) -> None:
    database_path = tmp_path / "migration.db"
    config = migration_config(database_path)

    command.upgrade(config, "head")
    engine = create_engine(f"sqlite:///{database_path.as_posix()}")

    assert "alembic_version" in inspect(engine).get_table_names()
    with engine.connect() as connection:
        assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == (
            "20260724_0001"
        )

    command.downgrade(config, "base")
    with engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM alembic_version")).scalar_one() == 0

    command.upgrade(config, "head")
    assert ScriptDirectory.from_config(config).get_heads() == ["20260724_0001"]
    engine.dispose()
