# Migraciones

Alembic controla todos los cambios de esquema. La revisión `20260724_0001` establece una línea base
vacía; las tablas funcionales comienzan en la Fase 3.

Desde la raíz:

```powershell
.\apps\api\.venv\Scripts\python.exe -m alembic -c .\apps\api\alembic.ini upgrade head
.\apps\api\.venv\Scripts\python.exe -m alembic -c .\apps\api\alembic.ini current
```

Toda migración debe probar `upgrade`, `downgrade` y otro `upgrade` sobre un archivo temporal antes de
usarse con datos persistentes.
