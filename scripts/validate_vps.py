"""Validate the reviewed VPS boundaries without contacting any server."""

from pathlib import Path

import yaml

root = Path(__file__).resolve().parents[1]
definition = yaml.safe_load(
    (root / "infrastructure/deployment/vps.compose.yaml").read_text()
)
services = definition["services"]
for name in ("api", "worker", "migrate", "admin", "reader"):
    service = services[name]
    assert service["read_only"] is True
    assert service["cap_drop"] == ["ALL"]
    assert service["security_opt"] == ["no-new-privileges:true"]
    assert service.get("mem_limit")
    assert service["logging"]["options"]["max-size"] == "10m"
    assert service["tmpfs"] == ["/tmp:size=128m,mode=1777"]
    assert not service.get("privileged", False)
    assert "build" not in service
for name in ("api", "worker", "migrate"):
    assert "ports" not in services[name], "Only internal web ports may be published"
for name in ("admin", "reader"):
    assert all(port.startswith("127.0.0.1:") for port in services[name]["ports"])
command = services["api"]["command"]
assert (
    command[command.index("--forwarded-allow-ips") + 1] == "172.30.84.11,172.30.84.12"
)
assert command[command.index("--root-path") + 1] == "/api"
assert definition["networks"]["default"]["ipam"]["config"] == [
    {"subnet": "172.30.84.0/24"}
]
nginx = (root / "infrastructure/deployment/followread.nginx.conf").read_text()
for required in (
    "followread.innovalogic.tech",
    "limit_req",
    "TLSv1.2 TLSv1.3",
    "Strict-Transport-Security",
    "127.0.0.1:5180",
    "127.0.0.1:5181",
    "location ~ ^/admin/api",
    "access_log off",
):
    assert required in nginx, required
print("VPS static security boundaries PASS")
