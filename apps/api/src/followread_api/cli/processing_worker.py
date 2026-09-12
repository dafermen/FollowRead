"""Single persistent audio worker. Interrupted jobs require an explicit retry."""

import signal
from pathlib import Path
from threading import Event

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from followread_api.api.dependencies import get_processing_service
from followread_api.cli.worker_lock import worker_lock
from followread_api.config import get_settings
from followread_api.database import create_session_factory, get_database_engine
from followread_api.models import JobStatus, ProcessingJob
from followread_api.services import PollyProcessingService


def recover_interrupted(session: Session) -> None:
    session.execute(
        update(ProcessingJob)
        .where(ProcessingJob.status == JobStatus.RUNNING)
        .values(
            status=JobStatus.FAILED,
            stage="interrupted",
            error_code="processing.interrupted",
            error_detail="Worker interrupted. Review provider charges before retrying.",
        )
    )
    session.commit()


def process_next(session: Session, service: PollyProcessingService) -> bool:
    job = session.scalar(
        select(ProcessingJob)
        .where(ProcessingJob.status == JobStatus.QUEUED)
        .order_by(ProcessingJob.created_at)
        .limit(1)
    )
    if job is None:
        return False
    claimed = session.scalar(
        update(ProcessingJob)
        .where(
            ProcessingJob.id == job.id,
            ProcessingJob.status == JobStatus.QUEUED,
        )
        .values(status=JobStatus.RUNNING)
        .returning(ProcessingJob.id)
    )
    session.commit()
    if claimed is None:
        return False
    try:
        if job.language is None or job.voice_id is None:
            raise ValueError("Queued job is missing its language or voice")
        service.process(
            content_version_id=job.content_version_id,
            language=job.language,
            voice_id=job.voice_id,
            idempotency_key=job.idempotency_key,
            resume_job_id=job.id,
        )
    except Exception:
        session.rollback()
        session.execute(
            update(ProcessingJob)
            .where(
                ProcessingJob.id == job.id,
                ProcessingJob.status != JobStatus.CANCELLED,
            )
            .values(
                status=JobStatus.FAILED,
                stage="failed",
                error_code="processing.failed",
                error_detail="Audio processing failed. Review the configuration before retrying.",
            )
        )
        session.commit()
    return True


def main() -> None:
    stop = Event()
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    factory = create_session_factory(get_database_engine())
    with worker_lock(Path(get_settings().audio_output_dir).parent / ".audio-worker.lock"):
        with factory() as session:
            recover_interrupted(session)
        while not stop.is_set():
            if Path("/tmp").is_dir():
                Path("/tmp/followread-worker-heartbeat").touch()
            with factory() as session:
                worked = process_next(session, get_processing_service(session))
            if not worked:
                stop.wait(1)


if __name__ == "__main__":
    main()
