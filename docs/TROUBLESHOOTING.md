# Solución de problemas

Esta es la entrada canónica para diagnosticar FollowRead.

## Primer diagnóstico

```powershell
pnpm dev:check
pnpm hooks:verify
pnpm check:fast
pnpm mobile:doctor
pnpm deploy:validate
```

Comprobar también:

- Node 24 y pnpm 11.9.0;
- Python 3.12 y `apps/api/.venv`;
- puertos 5173, 5174 y 8000 disponibles;
- migración SQLite aplicada;
- variables basadas en `.env.example`, sin secretos en Git.

## Guías específicas

- [Índice de diagnóstico](troubleshooting/README.md)
- [Android/Capacitor](troubleshooting/CAPACITOR_ANDROID.md)
- [iOS/Capacitor](troubleshooting/CAPACITOR_IOS.md)
- [Variables de entorno](development/ENVIRONMENT_VARIABLES.md)
- [Problemas conocidos](project-management/KNOWN_ISSUES.md)

Si el problema no está documentado, registrar síntomas, entorno, pasos de reproducción, resultado
esperado/actual y solución antes de cerrar la tarea.
