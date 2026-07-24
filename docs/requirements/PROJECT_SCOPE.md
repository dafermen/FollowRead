# Alcance del proyecto

**Estado:** Aprobado para Fase 0  
**Tarea responsable:** FR-PH00-TASK-004 - COMPLETED  
**Fecha:** 2026-07-24

## Alcance total

FollowRead comprende Admin web, Reader web/PWA/móvil, API, Reader Engine, procesamiento de audio,
contenido versionado, offline, progreso, favoritos, vocabulario, accesibilidad, seguridad, pruebas y
operación. El roadmap completo se ejecuta por fases; no todo pertenece al MVP.

## MVP: corte vertical web

El MVP es una demostración web/PWA completa del flujo principal. Debe validar sincronización,
publicación y offline antes de ampliar tipos, plataformas o datos personales.

### Admin MVP

- autenticación de usuarios editoriales;
- creación de un `story` bilingüe con capítulos y párrafos;
- audiencia, nivel, categoría, portada y voces;
- borrador/autoguardado y validaciones;
- procesamiento, revisión, aprobación y publicación;
- historial, error y reintento esencial.

### API MVP

- identidad, permisos y auditoría necesarios para Admin;
- contenido, traducciones, versiones y estados;
- catálogo público compatible;
- progreso, favoritos y vocabulario básicos;
- adaptadores Polly/S3 con falsos en automatización;
- health checks y OpenAPI.

### Reader MVP

- web responsive y PWA; no binarios móviles;
- catálogo incluido más catálogo remoto;
- biblioteca, detalle y lector para contenido de demostración;
- reproducción, palabra activa, resaltado, mano SVG opcional y auto-scroll;
- pausa, continuación, retroceso, repetición y velocidad;
- modos infantil, adulto, español, inglés y aprender inglés como configuraciones;
- progreso local y sincronizable;
- paquete descargable con checksum y recuperación;
- teclado, semántica, contraste y reducción de movimiento.

### Contenido MVP

- un cuento bilingüe principal y fixtures pequeños;
- traducciones y vocabulario creados editorialmente;
- derechos de texto, traducción, imagen y audio documentados;
- `story` implementado primero; otros tipos permanecen en el contrato del producto.

### Demostración de aceptación

```text
crear -> procesar -> revisar -> publicar -> descubrir -> descargar
-> reproducir sincronizado -> guardar progreso -> continuar offline
```

## Después del MVP, dentro del roadmap

- aplicaciones Android e iOS;
- libros, artículos y lecciones con experiencias específicas;
- notas libres y marcadores avanzados;
- analítica educativa compatible con privacidad;
- más idiomas;
- procesamiento distribuido con Redis/Celery o equivalente;
- recuperación de contraseña y administración avanzada;
- optimizaciones de escala y costos.

## Fuera del MVP, pero compatibles con la arquitectura

- cuentas personales de menores y portal de tutores;
- traducción automática o diccionario externo;
- monetización;
- notas libres;
- Android e iOS;
- procesamiento distribuido.

## Fuera de alcance salvo nueva decisión

- red social, chat o comentarios públicos;
- transmisión en vivo;
- DRM complejo;
- diagnóstico médico, terapia o evaluación académica certificada;
- IA como dependencia de una función esencial;
- llamadas directas de frontends a AWS;
- un tipo `document` independiente sin comportamiento diferenciador.

## Límites por componente

| Componente | Hace | No hace |
|---|---|---|
| Admin | Edita, procesa, revisa y publica | No se empaqueta en móvil ni llama AWS |
| Reader | Descubre, descarga y reproduce | No edita ni publica |
| API | Autoriza, valida y coordina | No presenta UI ni expone secretos |
| Reader Engine | Resuelve reproducción y temporización | No depende de React, DOM, AWS o red |
| Paquetes compartidos | Contratos y piezas reutilizables | No mezclan reglas específicas de apps |

## Restricciones

- tecnologías principales fijadas por el prompt;
- contenido actualizado sin rebuild;
- Admin nunca se empaqueta con Reader;
- pruebas AWS con mocks o adaptadores falsos;
- secretos fuera del repositorio;
- soporte razonable de navegadores modernos, Android e iOS;
- arquitectura preparada para procesamiento asíncrono futuro.

## Supuestos

- existe una persona responsable de contenido y otra capaz de aprobarlo;
- el contenido tiene derechos de reproducción, traducción, imágenes y audio;
- el backend está disponible al descargar o sincronizar, no al leer material local;
- la temporización pertenece a la versión exacta del texto;
- perfiles locales permiten probar Reader sin exigir cuenta.

## Dependencias externas

- Amazon Polly;
- Amazon S3;
- SQLite incluido en Python para el MVP;
- PostgreSQL sólo como evolución futura cuando escala, concurrencia o despliegue lo requieran;
- tiendas Apple y Google en Fase 10+;
- proveedor de hosting y observabilidad por definir.

## Decisiones de alcance

- `document` se representa como `article` hasta que exista un caso diferenciador.
- El MVP no crea cuentas personales de menores.
- Traducciones y significados esenciales son editoriales.
- Favoritos y posición están en MVP; notas libres quedan después.
- SQLite es la base autoritativa del MVP y elimina la dependencia de Docker/PostgreSQL.

## Validación

- MVP, roadmap y fuera de alcance están separados: PASS.
- Admin, Reader, API y Reader Engine tienen límites: PASS.
- Tipos de contenido iniciales están resueltos: PASS.
- Restricciones, supuestos y dependencias están explícitos: PASS.
