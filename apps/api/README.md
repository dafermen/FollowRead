# FollowRead API

Aplicación FastAPI. Es la única frontera autorizada para credenciales y adaptadores AWS.

## Desarrollo

Desde la raíz del repositorio:

```powershell
.\apps\api\.venv\Scripts\python.exe -m uvicorn followread_api.main:app `
  --app-dir .\apps\api\src --reload --port 8000
```

Comprobaciones:

```powershell
.\apps\api\.venv\Scripts\python.exe -m pytest .\apps\api
.\apps\api\.venv\Scripts\python.exe -m ruff check .\apps\api
.\apps\api\.venv\Scripts\python.exe -m mypy .\apps\api\src .\apps\api\tests
```

El endpoint `GET /health` no requiere PostgreSQL, Redis ni AWS.
