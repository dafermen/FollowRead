import importlib.util
from pathlib import Path
from types import ModuleType

import pytest


def module() -> ModuleType:
    path = Path(__file__).resolve().parents[3] / "scripts/vps_deploy.py"
    spec = importlib.util.spec_from_file_location("vps_deploy", path)
    assert spec is not None and spec.loader is not None
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


def test_mutable_tags_and_unexpected_settings_are_rejected(tmp_path: Path) -> None:
    script = module()
    manifest = tmp_path / "images.env"
    valid = "FOLLOWREAD_REVISION=" + "a" * 40 + "\n"
    for component in ("api", "admin", "reader"):
        valid += (
            f"FOLLOWREAD_{component.upper()}_IMAGE=ghcr.io/dafermen/followread/{component}@sha256:"
            + "b" * 64
            + "\n"
        )
    manifest.write_text(valid)
    assert script.load_release(manifest)["FOLLOWREAD_REVISION"] == "a" * 40
    manifest.write_text(valid.replace("@sha256:" + "b" * 64, ":latest"))
    with pytest.raises(ValueError, match="immutable"):
        script.load_release(manifest)
    manifest.write_text(valid + "OPENAI_API_KEY=not-allowed\n")
    with pytest.raises(ValueError, match="Unexpected"):
        script.load_release(manifest)


def test_plan_pulls_before_downtime_and_backs_up_before_migration() -> None:
    script = module()
    plan = script.deployment_plan(["docker", "compose"], initialize=False, rollback=False)
    assert plan[1][-1] == "pull"
    assert plan[2][-3:] == ["stop", "api", "worker"]
    assert "followread_api.cli.snapshot_data" in plan[3]
    assert plan[4][-1] == "migrate"
    assert "--wait" in plan[5]
    rollback = script.deployment_plan(["docker", "compose"], initialize=False, rollback=True)
    assert len(rollback) == 5
    assert "followread_api.cli.snapshot_data" in rollback[3]
