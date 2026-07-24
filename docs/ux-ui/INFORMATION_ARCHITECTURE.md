# Arquitectura de información

**Estado:** Validada  
**Tarea responsable:** FR-PH01-TASK-002 - COMPLETED

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

Navegación primaria propuesta: Inicio, Biblioteca, Mi lectura y Configuración. Lector es una ruta de
tarea enfocada y no una pestaña persistente.

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

Admin nunca aparece como enlace o ruta en Reader. Autorización servidor protege cada sección aunque
la navegación o URL sea manipulada.

## Objetos de información

| Objeto | Vistas principales | Estado visible |
|---|---|---|
| Contenido | lista, detalle, editor, Reader | tipo, idioma, nivel, versión |
| Versión | editor, revisión, publicación | workflow, compatibilidad, checksum |
| Trabajo | dashboard, procesamiento, errores | etapa, progreso, costo, error |
| Paquete | detalle, descargas | tamaño, versión, integridad |
| Progreso | inicio, historial, lector | local, pendiente, sincronizado |
| Perfil | configuración | local/cuenta, modo, preferencias |
| Vocabulario | lector, vocabulario | local, pendiente, sincronizado |

## Reglas de navegación

- Back conserva contexto, filtros y borrador.
- Deep links a Reader validan paquete/versión antes de abrir.
- Una ruta sin permiso muestra denegación segura, no contenido parcial.
- Offline oculta o deshabilita sólo acciones remotas y explica por qué.
- Infantil reduce navegación secundaria y requiere salida segura.
- Publicación y eliminación no dependen de navegación implícita.

## Validación

- 12 pantallas Reader ubicadas: PASS.
- 14 pantallas Admin ubicadas: PASS.
- Separación de aplicaciones: PASS.
- Estados offline, permiso y compatibilidad tienen ruta: PASS.
