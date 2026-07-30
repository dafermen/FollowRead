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
    "pnpm setup:python",
    "pnpm run ci",
):
    if command not in runs:
        raise ValueError(f"CI is missing required command: {command}")

for command in ("pnpm security:audit", "pnpm deploy:validate"):
    if command not in runs:
        raise ValueError(f"CI is missing Phase 13 command: {command}")

containers = mapping(jobs.get("containers"), "jobs.containers")
if containers.get("needs") != "quality":
    raise ValueError("Container builds must depend on the complete quality gate")
container_steps = containers.get("steps")
if not isinstance(container_steps, list):
    raise TypeError("jobs.containers.steps must be a list")
if not any(
    "docker build" in str(mapping(step, "container step").get("run", ""))
    for step in container_steps
):
    raise ValueError("CI must build the reviewed deployment containers")

if "secrets." in workflow_path.read_text(encoding="utf-8"):
    raise ValueError("Base CI must not consume repository secrets")

release_path = repository_root / ".github" / "workflows" / "release.yml"
release = mapping(
    yaml.load(release_path.read_text(encoding="utf-8"), Loader=yaml.BaseLoader),
    "release workflow",
)
release_permissions = mapping(release.get("permissions"), "release permissions")
if (
    release_permissions.get("contents") != "write"
    or release_permissions.get("packages") != "write"
):
    raise ValueError(
        "Release workflow requires only contents/packages write permissions"
    )
release_text = release_path.read_text(encoding="utf-8")
for requirement in (
    "pnpm security:audit",
    "docker push",
    "gh release create",
    "FOLLOWREAD_API_BASE_URL",
):
    if requirement not in release_text:
        raise ValueError(f"Release workflow is missing: {requirement}")
if "secrets." in release_text:
    raise ValueError(
        "Release workflow must use the scoped github.token, not repository secrets"
    )

smoke_path = repository_root / ".github" / "workflows" / "deployment-smoke.yml"
smoke_text = smoke_path.read_text(encoding="utf-8")
if "environment: ${{ inputs.environment }}" not in smoke_text:
    raise ValueError("Deployment smoke workflow must use protected GitHub environments")
if "node scripts/deployment-smoke-test.mjs" not in smoke_text:
    raise ValueError("Deployment smoke workflow is missing the real smoke test")

print("CI and release workflow validation PASS")
