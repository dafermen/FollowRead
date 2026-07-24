from types import TracebackType

from sqlalchemy.orm import Session, sessionmaker

from followread_api.models import ReadingContent
from followread_api.repositories.base import SqlAlchemyRepository
from followread_api.repositories.catalog import PublishedCatalogRepository


class SqlAlchemyUnitOfWork:
    """Transaction boundary shared by repositories participating in one use case."""

    def __init__(self, session_factory: sessionmaker[Session]) -> None:
        self.session = session_factory()
        self.contents = SqlAlchemyRepository(self.session, ReadingContent)
        self.catalog = PublishedCatalogRepository(self.session)

    def __enter__(self) -> "SqlAlchemyUnitOfWork":
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.rollback()
        self.session.close()

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()
