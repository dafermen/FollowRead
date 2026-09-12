"""Exercise the real TLS reverse proxy and production-mode API using synthetic data."""

import argparse
import http.cookiejar
import json
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--ca", required=True)
parser.add_argument("--reset-token-file", type=Path, required=True)
parser.add_argument("--base", default="https://localhost:5443")
args = parser.parse_args()
jar = http.cookiejar.CookieJar()
client = urllib.request.build_opener(
    urllib.request.HTTPSHandler(context=ssl.create_default_context(cafile=args.ca)),
    urllib.request.HTTPCookieProcessor(jar),
)


def request(
    path: str, body: object = None, *, csrf: bool = False
) -> tuple[int, object, object]:
    headers = {"Origin": args.base, "Content-Type": "application/json"}
    if csrf:
        headers["X-CSRF-Token"] = next(
            cookie.value for cookie in jar if cookie.name == "followread_csrf"
        )
    data = None if body is None else json.dumps(body).encode()
    try:
        response = client.open(
            urllib.request.Request(args.base + path, data=data, headers=headers),
            timeout=15,
        )
    except urllib.error.HTTPError as error:
        response = error
    content = response.read().decode()
    payload = (
        json.loads(content)
        if "application/json" in response.headers.get("content-type", "")
        else content
    )
    return response.status, payload, response.headers


deadline = time.monotonic() + 90
while time.monotonic() < deadline:
    try:
        if request("/api/ready")[0] == 200:
            break
    except (urllib.error.URLError, TimeoutError):
        pass
    time.sleep(1)
else:
    raise AssertionError("Production API did not become ready")

for path, marker in [
    ("/", "FollowRead Reader"),
    ("/admin/", "FollowRead Admin"),
    ("/admin/docs/", "FollowRead Documentation"),
]:
    code, page, headers = request(path)
    assert code == 200 and marker in page, path
    assert headers["Strict-Transport-Security"] == "max-age=31536000"
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert "frame-ancestors 'none'" in headers["Content-Security-Policy"]
    print("PASS HTTPS", path)

for path in [
    "/api/metrics",
    "/api/docs",
    "/api/openapi.json",
    "/admin/api/auth/login",
    "/.env",
]:
    assert request(path)[0] == 404, path
print("PASS private endpoints and hidden files blocked")
code, _, _ = request("/api/admin/access")
assert code == 401, f"Unauthenticated admin access returned {code}"
code, _, headers = request(
    "/api/auth/login",
    {
        "email": "vps-test@example.invalid",
        "password": "Synthetic test password only 2026!",
    },
)
assert code == 200, code
assert headers["Cache-Control"] == "no-store"
cookies = headers.get_all("Set-Cookie")
assert any("HttpOnly" in item for item in cookies)
assert all("Secure" in item and "SameSite=strict" in item for item in cookies)
assert request("/api/admin/access")[0] == 200
code, catalog, _ = request("/api/admin/content")
assert code == 200 and catalog["total"] >= 1
content_id = catalog["items"][0]["id"]
code, editor, _ = request(f"/api/admin/content/{content_id}/editor")
assert code == 200
body = {
    "content_version_id": editor["content_version_id"],
    "language": "es",
    "voice_id": "marin",
    "idempotency_key": "container-queue-test",
}
assert request("/api/admin/processing", body)[0] == 403
code, queued, _ = request("/api/admin/processing", body, csrf=True)
assert code == 202 and queued["status"] in {"queued", "succeeded"}
deadline = time.monotonic() + 30
while time.monotonic() < deadline:
    _, jobs, _ = request("/api/admin/processing")
    job = next(item for item in jobs["items"] if item["id"] == queued["id"])
    if job["status"] == "succeeded":
        break
    assert job["status"] in {"queued", "running"}, job["status"]
    time.sleep(0.25)
else:
    raise AssertionError("Persistent worker did not complete the queued job")
print("PASS secure cookies, authorization, CSRF and persistent audio worker")
reset_token = args.reset_token_file.read_text().strip()
new_password = "Changed synthetic password only 2026!"
assert (
    request("/api/auth/password-reset/request", {"email": "vps-test@example.invalid"})[
        0
    ]
    == 503
)
assert (
    request(
        "/api/auth/password-reset/confirm",
        {"token": reset_token, "password": new_password},
    )[0]
    == 200
)
assert request("/api/admin/access")[0] == 401
assert (
    request(
        "/api/auth/password-reset/confirm",
        {"token": reset_token, "password": new_password},
    )[0]
    == 400
)
assert (
    request(
        "/api/auth/login",
        {"email": "vps-test@example.invalid", "password": new_password},
    )[0]
    == 200
)
print("PASS one-use password reset, session revocation and new login over HTTPS")
statuses = [
    request(
        "/api/auth/login", {"email": "nobody@example.invalid", "password": "invalid"}
    )[0]
    for _ in range(12)
]
assert 429 in statuses, statuses
print("PASS login rate limit")
print("Production HTTPS integration PASS")
