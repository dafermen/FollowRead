from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError


class PasswordService:
    def __init__(self, password_hash: PasswordHash | None = None) -> None:
        self._password_hash = password_hash or PasswordHash.recommended()

    def hash(self, password: str) -> str:
        return self._password_hash.hash(password)

    def verify_and_update(self, password: str, encoded_hash: str) -> tuple[bool, str | None]:
        try:
            return self._password_hash.verify_and_update(password, encoded_hash)
        except UnknownHashError:
            return False, None
