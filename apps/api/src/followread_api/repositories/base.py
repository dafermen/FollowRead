from uuid import UUID

from sqlalchemy.orm import Session

from followread_api.models import Base


class SqlAlchemyRepository[ModelT: Base]:
    """Small persistence contract for aggregate roots.

    Changes are only staged here. The unit of work owns commit and rollback.
    """

    def __init__(self, session: Session, model_type: type[ModelT]) -> None:
        self._session = session
        self._model_type = model_type

    def add(self, entity: ModelT) -> ModelT:
        self._session.add(entity)
        return entity

    def get(self, entity_id: UUID) -> ModelT | None:
        return self._session.get(self._model_type, entity_id)

    def remove(self, entity: ModelT) -> None:
        self._session.delete(entity)
