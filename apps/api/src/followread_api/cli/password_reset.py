"""Issue a private initial/recovery link through an authorized operator."""

import argparse
from pathlib import Path

from followread_api.database import create_session_factory, get_database_engine
from followread_api.services.password_reset import issue_reset


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--minutes", type=int, default=15)
    args = parser.parse_args()
    # Refuse to overwrite a prior secret or follow a symlink.
    args.output.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with args.output.open("x", encoding="utf-8") as output:
        args.output.chmod(0o600)
        with create_session_factory(get_database_engine())() as session:
            link = issue_reset(session, args.email, minutes=args.minutes, cooldown=False)
        if link is None:
            raise SystemExit("No active administrator matched the requested account")
        output.write(link + "\n")
    print("One-use recovery link saved to the private output file")


if __name__ == "__main__":
    main()
