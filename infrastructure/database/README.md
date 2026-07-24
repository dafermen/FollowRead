# Base de datos

El MVP usa SQLite con SQLAlchemy y Alembic. La base local vive en `var/followread.db`, fuera de Git.
Tests y migraciones usan archivos temporales aislados.

PostgreSQL queda como evolución futura. Cualquier migración deberá conservar comportamiento,
integridad, historial de Alembic y una estrategia probada de exportación/importación.
