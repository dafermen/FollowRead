# FollowRead API

FastAPI application. It is the only authorized boundary for credentials and AWS adapters.

## Development

From the repository root:

```powershell
.\apps\api\.venv\Scripts\python.exe -m uvicorn followread_api.main:app `
  --app-dir .\apps\api\src --reload --port 8000
```

Checks:

```powershell
.\apps\api\.venv\Scripts\python.exe -m pytest .\apps\api
.\apps\api\.venv\Scripts\python.exe -m ruff check .\apps\api
.\apps\api\.venv\Scripts\python.exe -m mypy .\apps\api\src .\apps\api\tests
```

Migrations:

```powershell
pnpm migrate
pnpm demo:seed
```

The `GET /health` endpoint does not require SQLite, Redis, or AWS. SQLite uses
`var/followread.db` by default and PostgreSQL is out of scope for the MVP.

## MVP processing

The API uses simulated local audio by default. It generates deterministic files and Speech Marks without
account, network, or cost. The optional Amazon Polly contract is activated only with
`FOLLOWREAD_POLLY_PROVIDER=aws`; tests never make real AWS calls.

The administrative contracts for content, illustrations, processing, review, and publishing
can be explored at `http://localhost:8000/docs` when running the project.

The demo story is available at
`GET /catalog/el-zorro-y-la-luna/reader-package`. The seed command is idempotent.
