from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from followread_api.security import PasswordService


def test_passwords_use_argon2id_and_verify_without_rehash() -> None:
    service = PasswordService()

    encoded_hash = service.hash("correct horse battery staple")
    verified, updated_hash = service.verify_and_update(
        "correct horse battery staple",
        encoded_hash,
    )

    assert encoded_hash.startswith("$argon2id$")
    assert "correct horse battery staple" not in encoded_hash
    assert verified
    assert updated_hash is None


def test_password_verification_rejects_wrong_and_unknown_hashes() -> None:
    service = PasswordService()
    encoded_hash = service.hash("correct horse battery staple")

    assert service.verify_and_update("incorrect", encoded_hash) == (False, None)
    assert service.verify_and_update("password", "not-a-supported-hash") == (False, None)


def test_password_verification_returns_upgraded_hash() -> None:
    legacy_parameters = PasswordHash((Argon2Hasher(memory_cost=1024, time_cost=1),))
    current_parameters = PasswordHash((Argon2Hasher(memory_cost=2048, time_cost=2),))
    encoded_hash = legacy_parameters.hash("correct horse battery staple")

    verified, updated_hash = PasswordService(current_parameters).verify_and_update(
        "correct horse battery staple",
        encoded_hash,
    )

    assert verified
    assert updated_hash is not None
    assert updated_hash != encoded_hash
