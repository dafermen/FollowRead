class InvalidEmailError(ValueError):
    pass


def normalize_email(email: str) -> str:
    normalized = email.strip().casefold()
    local_part, separator, domain = normalized.partition("@")
    if (
        separator != "@"
        or not local_part
        or not domain
        or len(normalized) > 320
        or any(character.isspace() for character in normalized)
    ):
        raise InvalidEmailError("Enter a valid email address.")
    return normalized
