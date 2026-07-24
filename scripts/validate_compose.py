from pathlib import Path
from typing import Any, cast

import yaml


def require_mapping(value: object, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise TypeError(f"{label} must be a mapping")
    return cast(dict[str, Any], value)


repository_root = Path(__file__).resolve().parents[1]
document = require_mapping(
    yaml.safe_load((repository_root / "compose.yaml").read_text(encoding="utf-8")),
    "compose document",
)
services = require_mapping(document.get("services"), "services")
postgres = require_mapping(services.get("postgres"), "services.postgres")

if postgres.get("image") != "postgres:18.4-alpine3.24":
    raise ValueError("PostgreSQL image must use the reviewed immutable version tag")

ports = postgres.get("ports")
if not isinstance(ports, list) or not any(
    str(port).startswith("127.0.0.1:") for port in ports
):
    raise ValueError("PostgreSQL must bind only to the loopback interface")

volumes = postgres.get("volumes")
if not isinstance(volumes, list) or not any(
    str(volume).endswith(":/var/lib/postgresql") for volume in volumes
):
    raise ValueError("PostgreSQL 18 data must persist under /var/lib/postgresql")

healthcheck = require_mapping(
    postgres.get("healthcheck"), "services.postgres.healthcheck"
)
test = healthcheck.get("test")
if not isinstance(test, list) or not any("pg_isready" in str(item) for item in test):
    raise ValueError("PostgreSQL healthcheck must use pg_isready")

environment = require_mapping(
    postgres.get("environment"), "services.postgres.environment"
)
for variable in ("POSTGRES_DB", "POSTGRES_PASSWORD", "POSTGRES_USER"):
    if variable not in environment:
        raise ValueError(f"{variable} is required")

print("compose static validation PASS")
