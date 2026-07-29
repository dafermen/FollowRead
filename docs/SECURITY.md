# Seguridad

Esta es la entrada canónica a la seguridad de FollowRead.

## Reglas obligatorias

- no guardar secretos, tokens, certificados, SQLite ni archivos `.env` reales en Git;
- no registrar texto leído, vocabulario, tokens ni PII;
- no crear cuentas personales de menores en el MVP;
- mantener autenticación, autorización y auditoría del lado de la API;
- usar adaptadores locales en pruebas; no depender de AWS real;
- auditar dependencias antes de un release;
- tratar findings de seguridad como bloqueadores hasta resolverlos o aprobar una excepción fechada.

## Verificación

```powershell
pnpm security:audit
pnpm check
pnpm quality:regression
```

El reporte de una vulnerabilidad no debe realizarse en un issue público. Hasta definir un canal
privado formal, debe comunicarse directamente al propietario del repositorio.

## Fuentes detalladas

- [Estrategia de seguridad](architecture/SECURITY_STRATEGY.md)
- [Modelo de amenazas](architecture/THREAT_MODEL.md)
- [Auditoría de Fase 12](architecture/PHASE_12_SECURITY_AUDIT.md)
- [Política de datos](requirements/DATA_POLICY.md)
- [Variables de entorno](development/ENVIRONMENT_VARIABLES.md)
