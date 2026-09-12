"""Synthetic data for the isolated container test, never a production bootstrap."""

import os
from pathlib import Path

from followread_api.cli.seed_demo_story import seed_demo_story
from followread_api.database import create_session_factory, get_database_engine
from followread_api.services import bootstrap_superadmin

if os.environ.get("FOLLOWREAD_TEST_FIXTURE") != "ISOLATED_CONTAINER_ONLY":
    raise SystemExit("This fixture requires the isolated container test marker")

with create_session_factory(get_database_engine())() as session:
    bootstrap_superadmin(
        session,
        email="vps-test@example.invalid",
        display_name="Container test",
        password="Synthetic test password only 2026!",
    )
    session.commit()
    seed_demo_story(
        session,
        cover_path=Path("/fixtures/el-zorro-y-la-luna-cover.png"),
        chapter_two_path=Path("/fixtures/el-zorro-y-la-luna-chapter-2.png"),
        audio_output_dir=Path("/data/audio"),
    )
print("Synthetic owner and published story prepared")
