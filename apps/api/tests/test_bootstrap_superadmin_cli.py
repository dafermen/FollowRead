from unittest.mock import Mock

from followread_api.cli import bootstrap_superadmin as command
from followread_api.database import create_database_engine
from followread_api.models import Base


def test_parser_requires_identity_arguments() -> None:
    arguments = command.build_parser().parse_args(
        ["--email", "admin@example.com", "--display-name", "Owner"],
    )

    assert arguments.email == "admin@example.com"
    assert arguments.display_name == "Owner"


def test_command_rejects_mismatched_passwords(monkeypatch, capsys) -> None:
    password_reader = Mock(side_effect=["first sufficiently long", "different password value"])
    monkeypatch.setattr(command.getpass, "getpass", password_reader)

    exit_code = command.main(
        ["--email", "admin@example.com", "--display-name", "Owner"],
    )

    assert exit_code == 2
    assert "do not match" in capsys.readouterr().out
    assert password_reader.call_count == 2


def test_command_creates_admin_and_reports_safe_repeat(monkeypatch, capsys) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    monkeypatch.setattr(command, "get_database_engine", lambda: engine)
    monkeypatch.setattr(
        command.getpass,
        "getpass",
        Mock(return_value="a sufficiently long password"),
    )
    arguments = ["--email", "admin@example.com", "--display-name", "Owner"]

    assert command.main(arguments) == 0
    assert "created" in capsys.readouterr().out
    assert command.main(arguments) == 0
    assert "already exists" in capsys.readouterr().out

    engine.dispose()


def test_command_reports_invalid_input(monkeypatch, capsys) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    monkeypatch.setattr(command, "get_database_engine", lambda: engine)
    monkeypatch.setattr(command.getpass, "getpass", Mock(return_value="short"))

    exit_code = command.main(
        ["--email", "admin@example.com", "--display-name", "Owner"],
    )

    assert exit_code == 2
    assert "between 15 and 128" in capsys.readouterr().out
    engine.dispose()
