# Flujos de usuario

**Estado:** Validado  
**Tarea responsable:** FR-PH01-TASK-002 - COMPLETED

## Flujo editorial principal

```mermaid
flowchart LR
    draft["Crear/editar borrador"] --> validate["Validar"]
    validate --> process["Procesar audio y marcas"]
    process --> review["Revisar"]
    review -->|rechazar| draft
    review --> approve["Aprobar"]
    approve --> publish["Confirmar y publicar"]
    process -->|fallo| error["Diagnosticar/reintentar"]
    error --> process
```

## Lectura y offline

```mermaid
flowchart LR
    discover["Explorar"] --> detail["Detalle"]
    detail --> read["Leer"]
    detail --> download["Descargar temporal"]
    download --> verify["Validar integridad"]
    verify --> read
    read --> progress["Guardar progreso local"]
    progress --> sync["Sincronizar cuando haya red"]
    verify -->|fallo| keep["Conservar versión anterior"]
```

## Aprender inglés

```mermaid
flowchart LR
    english["Abrir texto inglés"] --> play["Escuchar"]
    play --> word["Seleccionar palabra/oración"]
    word --> repeat["Repetir/cambiar velocidad"]
    word --> translation["Ver apoyo editorial"]
    translation --> vocabulary["Guardar vocabulario"]
    vocabulary --> play
```

## Cobertura de casos

| Caso | Inicio | Camino principal | Alterno crítico | Fin seguro |
|---|---|---|---|---|
| FR-UC-001 | lista/crear | editar-procesar-revisar-publicar | fallo/rechazo | versión o borrador |
| FR-UC-002 | detalle/lector | cargar-reproducir-seguir-guardar | audio/marcas/resize | progreso conservado |
| FR-UC-003 | detalle | descargar-validar-activar-leer | red/checksum/espacio | versión válida |
| FR-UC-004 | inicio/refresco | comparar-descargar-migrar | incompatible/corrupta | catálogo válido |
| FR-UC-005 | lector | palabra-repetir-traducir-guardar | apoyo ausente/offline | posición conservada |
| FR-UC-006 | ruta privilegiada | autorizar-denegar-auditar | sesión expirada | sin efectos |
| FR-UC-007 | configuración | elegir-previsualizar-aplicar | almacenamiento/movimiento | preferencias seguras |
| FR-UC-008 | editor | detectar-comparar-restaurar | conflicto/corrupción | sin sobreescritura |
| FR-UC-009 | reconexión | enviar-validar-aplicar-confirmar | conflicto/token/reenvío | pendiente o confirmado |
| FR-UC-010 | errores | inspeccionar-corregir-reintentar | costo/permiso/proveedor | evidencia conservada |
| FR-UC-011 | biblioteca | combinar-filtrar-detalle | vacío/incompatible/offline | contenido o explicación |
| FR-UC-012 | mi lectura | cambiar local-sincronizar | duplicado/token/sin cuenta | dato local/confirmado |

## Foco y anuncios

- Navegar cambia foco al encabezado principal sólo cuando corresponde.
- Diálogos devuelven foco al disparador.
- Auto-scroll no mueve foco.
- Guardado, descarga y sincronización usan regiones de estado moderadas.
- Errores colocan foco en resumen y enlazan campos.

## Resultado

- 12 de 12 casos cubiertos: PASS.
- Error, offline, permiso, recuperación y accesibilidad: PASS.
- Reader/Admin separados: PASS.
