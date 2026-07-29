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
- ilustraciones opcionales por capítulo con fallback automático a la portada;
- nueva ilustración original para **The Shining Path / El sendero brillante**, capítulo 2 de
  **The Fox and the Moon / El zorro y la luna**.

### Changed

- SQLite es la persistencia autoritativa del MVP;
- el indicador de lectura ahora es una mano debajo de la palabra y las correcciones de voz nunca
  hacen retroceder el resaltado;
- la mano de lectura usa el gesto `👆` para señalar claramente la palabra desde abajo;
- el checksum del paquete publicado se actualiza al cambiar audio o marcas temporales;
- el Reader refresca el bootstrap incluido cuando cambia su checksum y evita servirlo desde una
  caché obsoleta.

### Fixed

- el Reader ya no intenta reproducir rutas locales generadas por el adaptador simulado como si
  fueran MP3 publicados;
- una versión offline incluida obsoleta ya no oculta el audio real disponible en la API;
- el botón EN ya no queda sin efecto cuando el alineador externo entrega dos marcas con una pequeña
  superposición temporal.
- el resaltado sincronizado ya no cambia la palabra de `inline` a `inline-block`, por lo que el
  párrafo mantiene su composición durante la narración;
- el desplazamiento automático ya no recentra cada palabra que continúa dentro del área visible.

## 0.0.0 - MVP en desarrollo

- Fases 0 a 12 completadas.
- Fase 13 preparada localmente y pendiente de Docker, GitHub y staging reales.
