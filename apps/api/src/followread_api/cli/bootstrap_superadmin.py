import argparse
import getpass
from collections.abc import Sequence

from followread_api.database import create_session_factory, get_database_engine
from followread_api.services.bootstrap import (
    BootstrapConflictError,
    BootstrapInputError,
    bootstrap_superadmin,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create the first FollowRead superadministrator safely.",
    )
    parser.add_argument("--email", required=True)
    parser.add_argument("--display-name", required=True)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    arguments = build_parser().parse_args(argv)
    password = getpass.getpass("Password: ")
    confirmation = getpass.getpass("Confirm password: ")
    if password != confirmation:
        print("The passwords do not match.")
        return 2

    session_factory = create_session_factory(get_database_engine())
    with session_factory() as session:
        try:
            result = bootstrap_superadmin(
                session,
                email=arguments.email,
                display_name=arguments.display_name,
                password=password,
            )
            session.commit()
        except (BootstrapInputError, BootstrapConflictError) as error:
            session.rollback()
            print(str(error))
            return 2

    state = "created" if result.created else "already exists"
    print(f"Superadministrator {result.email} {state}.")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
