# Information Architecture

**Status:** Validated  
**Responsible task:** FR-PH01-TASK-002 - COMPLETED
**Locale note:** Spanish labels in the trees intentionally reproduce the application's current
default UI; the architecture descriptions are in English.

## Reader

```text
Reader
├── Inicio
│   ├── Continuar lectura
│   └── Recomendaciones/categorías
├── Biblioteca
│   ├── Categorías
│   ├── Búsqueda/filtros
│   └── Detalle
│       ├── Leer
│       └── Descargar
├── Lector
│   ├── Controles
│   ├── Traducción/vocabulario
│   └── Preferencias rápidas
├── Mi lectura
│   ├── Descargas
│   ├── Favoritos
│   ├── Historial
│   └── Vocabulario
└── Configuración
    ├── Modo/apariencia/accesibilidad
    └── Perfil local/cuenta futura
```

Proposed primary navigation: Home, Library, My Reading, and Settings. Reader is a task-focused route and not a persistent tab.

## Admin

```text
Admin
├── Login
├── Dashboard
├── Contenido
│   ├── Lista
│   ├── Crear/editar
│   ├── Capítulos/párrafos
│   ├── Traducciones
│   ├── Voz/recursos
│   └── Previsualización
├── Flujo editorial
│   ├── Procesamiento
│   ├── Revisión
│   └── Publicación
└── Operación
    ├── Trabajos/errores
    └── Historial/auditoría
```

Admin never appears as a link or route in Reader. Server authorization protects each section even if navigation or URL is manipulated.

## Information objects

| Object | Main views | Visible state |
|---|---|---|
| Content | list, detail, editor, Reader | type, language, level, version |
| Version | editor, review, publish | workflow, compatibility, checksum |
| Job | dashboard, processing, errors | stage, progress, cost, error |
| Package | detail, downloads | size, version, integrity |
| Progress | home, history, reader | local, pending, synchronized |
| Profile | settings | local/account, mode, preferences |
| Vocabulary | reader, vocabulary | local, pending, synchronized |

## Navigation rules

- Back preserves context, filters, and draft.
- Deep links to Reader validate package/version before opening.
- A route without permission shows a safe denial, not partial content.
- Offline hides or disables only remote actions and explains why.
- Kids mode reduces secondary navigation and requires a safe exit.
- Publishing and deletion do not depend on implicit navigation.

## Validation

- 12 Reader screens located: PASS.
- 14 Admin screens located: PASS.
- Separation of applications: PASS.
- Offline, permission, and compatibility states have a path: PASS.
