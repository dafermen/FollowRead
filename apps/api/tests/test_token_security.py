from followread_api.security import TokenService


def test_issued_tokens_are_random_and_only_their_digest_needs_persistence() -> None:
    service = TokenService()

    first = service.issue()
    second = service.issue()

    assert first.plain != second.plain
    assert first.digest != second.digest
    assert len(first.plain) >= 43
    assert len(first.digest) == 64
    assert first.plain not in first.digest
    assert service.matches(first.plain, first.digest)


def test_token_comparison_rejects_modified_or_malformed_values() -> None:
    service = TokenService()
    token = service.issue()

    assert not service.matches(f"{token.plain}x", token.digest)
    assert not service.matches(token.plain, "not-the-token-digest")
