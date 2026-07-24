from uuid import uuid4

from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import AuditLog, Base, User


def test_audit_log_keeps_safe_structured_evidence() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        actor = User(external_subject="admin|audit")
        event = AuditLog(
            actor=actor,
            action="content.transition",
            target_type="ContentVersion",
            target_id=uuid4(),
            outcome="succeeded",
            correlation_id="request-1",
            event_metadata={"from": "approved", "to": "published"},
        )
        session.add(event)
        session.commit()

        assert event.actor is actor
        assert event.event_metadata == {"from": "approved", "to": "published"}

    engine.dispose()
