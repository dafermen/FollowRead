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

Migraciones:

```powershell
pnpm migrate
```

El endpoint `GET /health` no requiere SQLite, Redis ni AWS. SQLite usa
`var/followread.db` por defecto y PostgreSQL queda fuera del MVP.

## Procesamiento del MVP

La API usa audio local simulado por defecto. Genera archivos y Speech Marks deterministas sin
cuenta, red ni costo. El contrato opcional de Amazon Polly se activa sólo con
`FOLLOWREAD_POLLY_PROVIDER=aws`; las pruebas nunca realizan llamadas AWS reales.

Los contratos administrativos de contenido, ilustraciones, procesamiento, revisión y publicación
se pueden explorar en `http://localhost:8000/docs` al levantar el proyecto.
