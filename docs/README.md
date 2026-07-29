# Documentación de FollowRead

El PDF maestro permanece en esta carpeta como fuente original. Los documentos Markdown convierten
esa fuente en requisitos, decisiones y trabajo verificable.

## Mapa

### Entradas canónicas

| Documento | Propósito |
|---|---|
| `ARCHITECTURE.md` | Topología, límites y decisiones |
| `API.md` | Contratos y acceso a OpenAPI |
| `DEVELOPMENT.md` | Preparación y flujo de desarrollo |
| `TESTING.md` | Estrategia y trece pruebas obligatorias antes de desplegar |
| `DEPLOYMENT.md` | Secuencia y política de entrega |
| `OPERATIONS.md` | Salud, backup, observabilidad e incidentes |
| `SECURITY.md` | Privacidad, secretos, amenazas y auditoría |
| `TROUBLESHOOTING.md` | Diagnóstico y runbooks |

Estas entradas enlazan la documentación detallada; no la sustituyen.

### Fuentes detalladas

| Carpeta | Propósito |
|---|---|
| `requirements/` | Visión, alcance, requisitos, historias, casos y trazabilidad |
| `architecture/` | Contexto, límites, seguridad y decisiones técnicas |
| `ux-ui/` | Estrategia, flujos y diseño accesible |
| `testing/` | Estrategia, planes y evidencia de pruebas |
| `deployment/` | Entornos, despliegue, migración y rollback |
| `project-management/` | Fases, tareas, estado, riesgos, decisiones y sesiones |
| `development/` | Guías para contribuir y mantener el código |
| `troubleshooting/` | Diagnóstico por dominio |
| `api/` | Contratos y guía de API |
| `user-guides/` | Guías para lectores y administradores |
| `adr/` | Decisiones arquitectónicas con contexto y consecuencias |

## Inicio de cada sesión

Leer, en este orden:

1. `project-management/PROJECT_STATUS.md`
2. `project-management/PHASES.md`
3. `project-management/TASKS.md`
4. `project-management/NEXT_STEPS.md`
5. últimas entradas de `project-management/SESSION_LOG.md`
6. `project-management/KNOWN_ISSUES.md`
7. `project-management/DECISIONS.md`

Después identificar la primera tarea ejecutable y no adelantar fases.
