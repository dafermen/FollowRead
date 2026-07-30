# Migrations

Alembic controls all schema changes. Revision `20260724_0001` establishes an empty baseline; the functional tables begin in Phase 3.

From the repository root:

```powershell
.\apps\api\.venv\Scripts\python.exe -m alembic -c .\apps\api\alembic.ini upgrade head
.\apps\api\.venv\Scripts\python.exe -m alembic -c .\apps\api\alembic.ini current
```

Every migration must test `upgrade`, `downgrade`, and another `upgrade` on a temporary database before being used with persistent data.
