# Changelog

Los cambios relevantes de FollowRead se documentan aquí siguiendo el estilo de Keep a Changelog.
El proyecto aún no tiene una versión pública estable.

## Unreleased

### Added

- estructura documental canónica y ADR;
- política de trece categorías de pruebas antes del despliegue;
- continuidad obligatoria mediante `AGENTS.md` y `CURRENT_STATUS.md`;
- CI, contenedores, backup/restore, release notes, smoke y rollback preparados;
- narración OpenAI opcional con alineación por palabra y MP3 servido sólo desde la API.
- caché persistente de narración basada en la huella del texto, voz y modelos para evitar llamadas
  repetidas al proveedor de pago.

### Changed

- SQLite es la persistencia autoritativa del MVP;
- el indicador de lectura ahora es una mano debajo de la palabra y las correcciones de voz nunca
  hacen retroceder el resaltado.

## 0.0.0 - MVP en desarrollo

- Fases 0 a 12 completadas.
- Fase 13 preparada localmente y pendiente de Docker, GitHub y staging reales.
