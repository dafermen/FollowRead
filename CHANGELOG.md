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
- narración publicada del cuento de demostración con OpenAI `marin` en español y `cedar` en inglés.

### Changed

- SQLite es la persistencia autoritativa del MVP;
- el indicador de lectura ahora es una mano debajo de la palabra y las correcciones de voz nunca
  hacen retroceder el resaltado;
- el checksum del paquete publicado se actualiza al cambiar audio o marcas temporales;
- el Reader refresca el bootstrap incluido cuando cambia su checksum y evita servirlo desde una
  caché obsoleta.

### Fixed

- el Reader ya no intenta reproducir rutas locales generadas por el adaptador simulado como si
  fueran MP3 publicados;
- una versión offline incluida obsoleta ya no oculta el audio real disponible en la API;
- el botón EN ya no queda sin efecto cuando el alineador externo entrega dos marcas con una pequeña
  superposición temporal.

## 0.0.0 - MVP en desarrollo

- Fases 0 a 12 completadas.
- Fase 13 preparada localmente y pendiente de Docker, GitHub y staging reales.
