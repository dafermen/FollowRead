import hashlib
import hmac
import secrets
from dataclasses import dataclass


@dataclass(frozen=True)
class OpaqueToken:
    plain: str
    digest: str


class TokenService:
    def issue(self) -> OpaqueToken:
        plain = secrets.token_urlsafe(32)
        return OpaqueToken(plain=plain, digest=self.digest(plain))

    def digest(self, plain: str) -> str:
        return hashlib.sha256(plain.encode("utf-8")).hexdigest()

    def matches(self, plain: str, expected_digest: str) -> bool:
        return hmac.compare_digest(self.digest(plain), expected_digest)
