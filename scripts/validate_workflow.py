from pathlib import Path
from typing import Any, cast

import yaml


def mapping(value: object, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise TypeError(f"{label} must be a mapping")
    return cast(dict[str, Any], value)


repository_root = Path(__file__).resolve().parents[1]
workflow_path = repository_root / ".github" / "workflows" / "ci.yml"
workflow = mapping(
    yaml.load(workflow_path.read_text(encoding="utf-8"), Loader=yaml.BaseLoader),
    "workflow",
)

if mapping(workflow.get("permissions"), "permissions").get("contents") != "read":
    raise ValueError("CI must use read-only repository permissions")

jobs = mapping(workflow.get("jobs"), "jobs")
quality = mapping(jobs.get("quality"), "jobs.quality")
steps = quality.get("steps")
if not isinstance(steps, list):
    raise TypeError("jobs.quality.steps must be a list")

uses = {
    str(mapping(step, "step").get("uses"))
    for step in steps
    if mapping(step, "step").get("uses") is not None
}
required_actions = {
    "actions/checkout@v6",
    "actions/setup-node@v5",
    "actions/setup-python@v6",
    "pnpm/action-setup@v6",
}
if not required_actions.issubset(uses):
    raise ValueError("CI action versions do not match the reviewed toolchain")

runs = {
    str(mapping(step, "step").get("run"))
    for step in steps
    if mapping(step, "step").get("run") is not None
}
for command in (
    "pnpm install --frozen-lockfile",
    "python -m venv apps/api/.venv",
    "pnpm ci",
):
    if command not in runs:
        raise ValueError(f"CI is missing required command: {command}")

if "secrets." in workflow_path.read_text(encoding="utf-8"):
    raise ValueError("Base CI must not consume repository secrets")

print("CI workflow validation PASS")
