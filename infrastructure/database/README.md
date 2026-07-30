# Database

The MVP uses SQLite with SQLAlchemy and Alembic. The local database lives in `var/followread.db`, outside of Git.
Tests and migrations use isolated temporary files.

PostgreSQL is planned as a future evolution. Any migration must preserve behavior,
integrity, Alembic history, and include a tested export/import strategy.
