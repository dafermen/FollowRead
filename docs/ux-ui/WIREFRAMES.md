# FollowRead Wireframes

**Status:** Reader and Admin validated  
**Reader Task:** FR-PH01-TASK-003 - COMPLETED  
**Admin Task:** FR-PH01-TASK-004 - COMPLETED  
**Convention:** low-fidelity diagrams; do not represent final color, typography, or exact dimensions.
**Locale note:** Spanish labels inside the diagrams intentionally reproduce the application's
current default UI; all explanatory documentation is in English.

## Visual conventions

- `[ Action ]`: button or control.
- `( )`: single selection.
- `[x]`: preference enabled.
- `...`: variable content.
- `!`: state that needs attention.
- Order in the diagram: reading and focus order, unless otherwise noted.

## Reader Shell

### Compact

```text
┌──────────────────────────────┐
│ Logo / título        Estado  │
├──────────────────────────────┤
│                              │
│      Contenido principal     │
│                              │
├──────────────────────────────┤
│ Inicio Biblioteca Mi lectura │
│                 Configuración│
└──────────────────────────────┘
```

### Wide

```text
┌────────────┬─────────────────────────────────────┐
│ Logo       │ Título                   Estado     │
│ Inicio     ├─────────────────────────────────────┤
│ Biblioteca│ Contenido principal      Rail opc. │
│ Mi lectura│                                     │
│ Ajustes    │                                     │
└────────────┴─────────────────────────────────────┘
```

The shell is not shown as primary navigation during focused reading. Connection status uses text/semantics in addition to icon.

---

## FR-SCREEN-R01 - Home

**Primary action:** continue the last reading or choose a recommendation.

```text
┌──────────────────────────────┐
│ FollowRead        Sincronizado│
│ Hola / Bienvenido             │
│ ┌──────────────────────────┐ │
│ │ Continuar: título        │ │
│ │ 42% · disponible offline │ │
│ │ [ Continuar leyendo ]    │ │
│ └──────────────────────────┘ │
│ Recomendados                  │
│ [Portada] [Portada] [Portada] │
│ [ Explorar biblioteca ]       │
└──────────────────────────────┘
```

- **Focus:** title -> continue -> recommended -> library -> navigation.
- **States:** new (no continue card), offline (local only), progress pending.
- **Wide:** continue occupies the main column; recommendations form a grid.

## FR-SCREEN-R02 - Library

**Primary action:** choose content.

```text
┌──────────────────────────────┐
│ Biblioteca                   │
│ [ Buscar contenido... ]      │
│ [Categoría] [Idioma] [Nivel] │
│ 12 resultados · local/remoto │
│ ┌──────┐ Título              │
│ │cover │ story · beginner    │
│ └──────┘ [ Ver detalle ]     │
│ ...                          │
└──────────────────────────────┘
```

- **Focus:** title -> search -> filters -> results.
- **States:** empty with clear filters; remote error preserves local results; incremental loading.
- **Wide:** filters in a rail; results in an adaptive grid.

## FR-SCREEN-R03 - Categories

**Primary action:** select a category.

```text
┌──────────────────────────────┐
│ Categorías                   │
│ [ Todas ]                    │
│ [ Cuentos ]   [ Aprendizaje ]│
│ [ Artículos ] [ Libros ]     │
│ Categoría: Cuentos           │
│ [Portada] [Portada]          │
└──────────────────────────────┘
```

- **Focus:** title -> categories -> content.
- **States:** category with no results offers return to all; offline marks categories that are remote-only.
- **Wide:** categories as a side list and results on the right.

## FR-SCREEN-R04 - Search

**Primary action:** search by text and open a result.

```text
┌──────────────────────────────┐
│ Buscar                       │
│ [ aventura________ ] [Buscar]│
│ Filtros activos: Inglés ×    │
│ Resultados para "aventura"   │
│ 1. Título · nivel · idioma   │
│ 2. Título · nivel · idioma   │
└──────────────────────────────┘
```

- **Focus:** field -> search -> filters -> results.
- **States:** initial with suggestions; no results with correction; remote error with local search.
- **Announcement:** result count after submit, not on every keystroke.

## FR-SCREEN-R05 - Detail

**Primary action:** read; download when not yet local.

```text
┌──────────────────────────────┐
│ ‹ Biblioteca                 │
│ [       Portada       ]      │
│ Título                       │
│ story · beginner · EN/ES     │
│ Duración · tamaño · versión  │
│ [ Leer ahora ]               │
│ [ Descargar para offline ]   │
│ Descripción...               │
└──────────────────────────────┘
```

- **Focus:** back -> title/metadata -> read -> download -> description.
- **States:** downloading, downloaded, update available, incompatible, and withdrawn.
- **Wide:** cover on the left, data/actions on the right; description below.
- **Rule:** incompatible does not offer read/activate, but explains required version.

## FR-SCREEN-R06 - Reader

**Primary action:** play/control reading.

```text
┌──────────────────────────────┐
│ ‹ Salir  Título       42%    │
│ Modo: Aprender inglés   ⚙    │
├──────────────────────────────┤
│ The little [fox] jumps over  │
│             ☝                │
│ the quiet river.             │
│                              │
│ Traducción opcional...       │
├──────────────────────────────┤
│ 01:12 ━━━━━●━━━━━━ 03:10     │
│ [−10s] [▶/❚❚] [Repetir]      │
│ [0.75×] [Palabra] [Oración]  │
└──────────────────────────────┘
```

- **Focus:** exit -> mode/settings -> interactive text -> controls -> progress.
- **Auto-scroll:** moves content, never focus; keeps the word in a safe zone.
- **Hand:** non-interactive layer under the word; hidden by preference or reduced motion.
- **Child:** text/controls 44px+, fewer visible options, hand enabled by default, exit protected.
- **Adult:** hand hidden by default, theme/size, subdued controls.
- **Learn English:** tappable word, optional translation, repeat word/sentence, vocabulary.
- **States:** paused, buffering, audio missing, invalid marks, offline, orientation, and end of chapter.
- **Wide:** text centered with readable width; persistent bottom controls; translation rail only if space.

### Recoverable Reader Error

```text
│ ! No pudimos reproducir audio │
│ Tu posición está guardada.    │
│ [ Reintentar ] [ Leer texto ] │
│ Código: FR-AUDIO-...          │
```

## FR-SCREEN-R07 - Downloads

**Primary action:** manage a download.

```text
┌──────────────────────────────┐
│ Descargas          420 MB/2GB│
│ Título A · completa          │
│ [ Leer ] [ Eliminar local ]  │
│ Título B · 62%               │
│ ━━━━━━━━━●──── [ Pausar ]    │
│ ! Título C · checksum inválido│
│ [ Reintentar ]               │
└──────────────────────────────┘
```

- **Focus:** title -> per-item action; progress does not receive focus.
- **States:** queued, in progress, paused, validating, complete, out of space, corrupt.
- **Rule:** deleting local clarifies that progress/favorite are not removed.
- **Wide:** list with columns for size, version, state, and actions.

## FR-SCREEN-R08 - Favorites

**Primary action:** open a favorite.

```text
┌──────────────────────────────┐
│ Favoritos                    │
│ [ Filtrar ]                  │
│ ♥ Título · disponible offline│
│   [ Abrir ] [ Quitar ]       │
│ ♥ Título · sync pendiente    │
│   [ Abrir ] [ Quitar ]       │
└──────────────────────────────┘
```

- **Focus:** title -> filter -> favorite -> open/remove.
- **States:** empty with explore; local change pending; sync error.
- **Confirmation:** removing favorite is reversible via notice, not a blocking dialog.

## FR-SCREEN-R09 - History

**Primary action:** resume a reading.

```text
┌──────────────────────────────┐
│ Historial                    │
│ Hoy                          │
│ Título · 42% · palabra 318   │
│ [ Reanudar ]                 │
│ Ayer                         │
│ Título · completado          │
│ [ Leer de nuevo ]            │
└──────────────────────────────┘
```

- **Focus:** title -> chronological groups -> resume/read again.
- **States:** empty, local, synced, explainable conflict.
- **Rule:** shows a comprehensible position; the technical anchor does not dominate the UI.

## FR-SCREEN-R10 - Vocabulary

**Primary action:** study/open a word in context.

```text
┌──────────────────────────────┐
│ Mi vocabulario               │
│ [ Buscar palabra ] [Nivel]   │
│ fox /fɒks/         [▶]       │
│ zorro · "The little fox..."  │
│ [ Abrir contexto ] [ Quitar ]│
└──────────────────────────────┘
```

- **Focus:** search/filter -> word -> audio -> context -> remove.
- **States:** empty, offline with local/non-local audio, pending sync.
- **Rule:** meaning and example are editorial; does not require AI.

## FR-SCREEN-R11 - Settings

**Primary action:** apply reading preferences.

```text
┌──────────────────────────────┐
│ Configuración                │
│ Modo (•) Adulto ( ) Infantil│
│ Idioma [ Español ▾ ]         │
│ Texto  A−  [ A ]  A+         │
│ Tema   [Claro] [Oscuro]      │
│ [x] Resaltar palabra         │
│ [ ] Mostrar mano             │
│ [x] Reducir movimiento       │
│ [ Vista previa ] [ Guardar ] │
└──────────────────────────────┘
```

- **Focus:** groups in order -> preview -> save.
- **States:** system values, customized, local error and reset.
- **Rule:** visual change is previewed; reduce motion prevails over animation.
- **Wide:** form and preview side by side.

## FR-SCREEN-R12 - Profile

**Primary action:** choose or manage the reading profile.

```text
┌──────────────────────────────┐
│ Perfil                       │
│ [ Lector local ] Activo      │
│ Preferencias en este equipo  │
│ Progreso: local / pendiente  │
│ [ Cambiar perfil ]           │
│ [ Borrar datos locales... ]  │
│ Cuenta/sync: función futura  │
└──────────────────────────────┘
```

- **Focus:** active profile -> switch -> delete.
- **Child:** does not ask for legal name, email, age, or location.
- **States:** guest/local, storage unavailable, deletion confirmed.
- **Rule:** deleting local data lists affected progress, downloads, preferences, and vocabulary.

## Responsive adaptation

| Approximate range | Shell | Content | Controls |
|---|---|---:|---|
| <600px | top bar + bottom nav | one column | full width/44px child |
| 600-1023px | bottom nav or compact rail | 1–2 columns | grouped by task |
| >=1024px | persistent sidebar | grid + optional rail | visible context |

Final breakpoints will be decided by content reflow, not by device model.

## Reader validation matrix

| Screen | Primary action | Focus annotated | States | Compact | Wide |
|---|---:|---:|---:|---:|---:|
| R01 Home | PASS | PASS | PASS | PASS | PASS |
| R02 Library | PASS | PASS | PASS | PASS | PASS |
| R03 Categories | PASS | PASS | PASS | PASS | PASS |
| R04 Search | PASS | PASS | PASS | PASS | PASS |
| R05 Detail | PASS | PASS | PASS | PASS | PASS |
| R06 Reader | PASS | PASS | PASS | PASS | PASS |
| R07 Downloads | PASS | PASS | PASS | PASS | PASS |
| R08 Favorites | PASS | PASS | PASS | PASS | PASS |
| R09 History | PASS | PASS | PASS | PASS | PASS |
| R10 Vocabulary | PASS | PASS | PASS | PASS | PASS |
| R11 Settings | PASS | PASS | PASS | PASS | PASS |
| R12 Profile | PASS | PASS | PASS | PASS | PASS |

## Reader walkthroughs

- Discover -> detail -> read: PASS.
- Download -> validate -> read offline: PASS.
- Play -> repeat -> save progress: PASS.
- Learn English -> vocabulary -> context: PASS.
- Configure mode/motion -> reader: PASS.
- Audio/download error -> safe recovery: PASS.

---

# Admin Wireframes

## Admin Shell

```text
┌──────────────┬──────────────────────────────────────────────┐
│ FollowRead   │ Título                    Guardado / Usuario │
│ Dashboard    ├──────────────────────────────────────────────┤
│ Contenido    │                                              │
│ Procesamiento│            Contenido principal               │
│ Revisión     │                                              │
│ Operación    │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

In compact width, navigation opens via a button with an accessible name and returns focus to the button when closed. Elements without permission are not offered, but the API always re-authorizes.

| Approximate range | Navigation | Tables/pairs | Actions |
|---|---|---:|---|
| <600px | header + drawer | cards or stacked steps | contextual bottom bar |
| 600-1023px | collapsible rail | flexible grid / two panes if they fit | section header |
| >=1024px | persistent sidebar | tables and split panes | header/rail context |

Dangerous dialogs occupy a focused surface; in compact they may be full screen. This responsive rule applies to A01–A14 except where a more specific note exists.

## FR-SCREEN-A01 - Login

**Primary action:** sign in.

```text
┌──────────────────────────────┐
│ FollowRead Admin             │
│ Email [________________]     │
│ Contraseña [___________] [👁]│
│ [ Iniciar sesión ]           │
│ ! Credenciales no válidas    │
│ [ Recuperar acceso ] futuro  │
└──────────────────────────────┘
```

- **Focus:** title -> email -> password -> show -> sign in.
- **States:** initial, sending, invalid credential, rate limit, session expired.
- **Wide:** centered card; does not include Admin navigation before authentication.

## FR-SCREEN-A02 - Dashboard

**Primary action:** continue priority work.

```text
┌────────────────────────────────────────────┐
│ Dashboard                                  │
│ [ Crear contenido ]                        │
│ Requieren atención                         │
│ 3 revisiones · 1 trabajo fallido           │
│ [ Ver revisión ] [ Diagnosticar ]           │
│ Borradores recientes / actividad           │
└────────────────────────────────────────────┘
```

- **Focus:** title -> create -> alerts/actions -> recent.
- **States:** empty, loading, alerts, partial permission.
- **Compact:** cards stacked; one primary action per card.

## FR-SCREEN-A03 - Content list

**Primary action:** open or create content.

```text
┌────────────────────────────────────────────┐
│ Contenido                 [ Crear ]         │
│ [Buscar] [Estado] [Tipo] [Idioma] [Nivel] │
│ Título   Tipo   Versión  Estado   Acción   │
│ Luna     story v3       draft    [Editar] │
│ Río      story v1       review   [Abrir]  │
└────────────────────────────────────────────┘
```

- **Focus:** title -> create -> filters -> rows/actions.
- **States:** empty with create, no results, error, read-only permission.
- **Compact:** rows become cards with label-value pairs.

## FR-SCREEN-A04 - Create content

**Primary action:** create a draft.

```text
┌──────────────────────────────┐
│ Crear contenido              │
│ Tipo [ story ▾ ]             │
│ Título [______________]      │
│ Idiomas [x] EN [x] ES        │
│ Audiencia [_________▾]       │
│ Nivel [____________▾]        │
│ [ Crear borrador ]           │
└──────────────────────────────┘
```

- **Focus:** title -> fields -> error summary -> create.
- **States:** clean, invalid, creating, recoverable error.
- **Rule:** does not request audio/resources before a draft exists.

## FR-SCREEN-A05 - Edit content

**Primary action:** save valid changes.

```text
┌────────────────────────────────────────────┐
│ Editar: Luna             Guardado 10:42    │
│ [General] [Capítulos] [Traducción] [Voz]  │
│ Título [____________________________]      │
│ Descripción [_______________________]      │
│ Metadatos...                               │
│ [ Guardar ] [ Previsualizar ]              │
└────────────────────────────────────────────┘
```

- **Focus:** saved state -> tabs -> fields -> save/preview.
- **States:** saving, saved, local changes, offline, error and conflict.
- **Conflict:** compares "your version" and "remote version"; never overwrites automatically.
- **Compact:** tabs become selector/sections; save bar remains visible.

## FR-SCREEN-A06 - Chapters and paragraphs

**Primary action:** edit the structure.

```text
┌───────────────┬────────────────────────────┐
│ Capítulos     │ Capítulo 1                 │
│ 1. Inicio     │ Párrafo 1 [_____________]  │
│ 2. El río     │ Párrafo 2 [_____________]  │
│ [+ Capítulo]  │ [+ Párrafo] [ Guardar ]    │
└───────────────┴────────────────────────────┘
```

- **Focus:** tree -> add -> editor -> actions; reordering also works with keyboard.
- **States:** empty, selected, reordering, length error, pending changes.
- **Compact:** chapter list -> detail on a secondary route with back.

## FR-SCREEN-A07 - Translations

**Primary action:** associate English/Spanish text per unit.

```text
┌─────────────────────┬──────────────────────┐
│ Inglés              │ Español              │
│ P1 The little fox…  │ P1 El pequeño zorro…│
│ P2 [missing]        │ P2 El río…           │
│ [ Alinear unidades ] [ Guardar ]           │
└─────────────────────┴──────────────────────┘
```

- **Focus:** original unit -> related translation -> actions.
- **States:** missing, misaligned, complete, conflict.
- **Accessibility:** relationship does not rely on columns/color; IDs and headings announce pairs.
- **Compact:** pairs stacked one after another.

## FR-SCREEN-A08 - Voice settings

**Primary action:** choose valid voices.

```text
┌──────────────────────────────┐
│ Configuración de voz         │
│ Inglés [ Joanna ▾ ] [▶ Probar]│
│ Español [ Lupe ▾ ] [▶ Probar]│
│ Velocidad base [ 1.0 ▾ ]     │
│ Estimado: caracteres / costo │
│ [ Guardar configuración ]    │
└──────────────────────────────┘
```

- **Focus:** voice/test per language -> speed -> estimate -> save.
- **States:** not chosen, incompatible, shows loading/error, valid.
- **Rule:** test and cost go through the API; there are no AWS credentials in Admin.

## FR-SCREEN-A09 - Processing

**Primary action:** process, cancel, or retry depending on state.

```text
┌────────────────────────────────────────────┐
│ Procesamiento · versión 3                  │
│ Validar ✓  Audio 62%  Marcas —  Guardar — │
│ ━━━━━━━━━━━━━●───────────────────────────  │
│ Costo estimado / límite                    │
│ [ Cancelar ]                               │
│ Log seguro: etapa · hora · correlation ID │
└────────────────────────────────────────────┘
```

- **Focus:** title/state -> actions -> safe detail.
- **States:** ready, queued, in progress, canceling, failed, partial, complete, limit.
- **Failure:** shows preserved resources and `[ Reintentar ]`; does not duplicate work.
- **Compact:** stages stacked; progress preserves textual label.

## FR-SCREEN-A10 - Review

**Primary action:** approve or reject with evidence.

```text
┌────────────────────────────────────────────┐
│ Revisión · versión 3                       │
│ Checklist: texto ✓ audio ✓ marcas !        │
│ [ Abrir previsualización ]                 │
│ Comentario [________________________]      │
│ [ Rechazar ]              [ Aprobar ]      │
└────────────────────────────────────────────┘
```

- **Focus:** checklist -> preview -> comment -> reject/approve.
- **States:** pending, defect, comment required, list, insufficient permission.
- **Rule:** approve/reject produces an audited transition; color is not the sole signal.

## FR-SCREEN-A11 - Preview

**Primary action:** check the exact Reader experience.

```text
┌────────────────────────────────────────────┐
│ Preview versión 3 · EN · modo infantil    │
│ [Viewport móvil] [Tablet] [Amplio]         │
│ ┌────────────────────────────────────────┐ │
│ │ Texto [activo] + mano + controles      │ │
│ └────────────────────────────────────────┘ │
│ [ Marcar problema ] [ Volver a revisión ] │
└────────────────────────────────────────────┘
```

- **Focus:** viewport/mode options -> preview -> mark/back.
- **States:** audio missing, invalid marks, missing resources, valid.
- **Rule:** uses the same reading contracts/components, not a disconnected simulation.

## FR-SCREEN-A12 - Publish

**Primary action:** confirm publishing an approved version.

```text
┌──────────────────────────────┐
│ Publicar versión 3           │
│ ✓ approved · checksum listo  │
│ Idiomas EN/ES · min app 1.0  │
│ Esta acción crea publicación │
│ inmutable y auditable.       │
│ [ Cancelar ] [ Publicar ]    │
└──────────────────────────────┘
```

- **Focus:** summary -> cancel -> publish.
- **States:** blocked with reasons, confirmation, publishing, published, error.
- **Rule:** requires permission; never offers publish if validations are missing.

## FR-SCREEN-A13 - History and audit

**Primary action:** investigate a change.

```text
┌────────────────────────────────────────────┐
│ Historial                                  │
│ [Fecha] [Actor] [Acción] [Resultado]       │
│ 10:42 Ana  approved v3   éxito [Detalle]  │
│ 10:10 Luis retry job 92  éxito [Detalle]  │
└────────────────────────────────────────────┘
```

- **Focus:** filters -> events -> detail.
- **States:** empty, filtered, loading, event retained/expired.
- **Rule:** detail omits secrets and unnecessary data.

## FR-SCREEN-A14 - Errors and jobs

**Primary action:** diagnose and recover.

```text
┌────────────────────────────────────────────┐
│ Trabajos y errores                         │
│ ! Job 92 · speech marks · failed           │
│ Código seguro · correlation ID · 10:10     │
│ Recursos: audio conservado / marcas no     │
│ [ Ver diagnóstico ] [ Reintentar ]         │
└────────────────────────────────────────────┘
```

- **Focus:** filters -> job -> diagnose/retry.
- **States:** active, failed, canceled, limit, recovered.
- **Rule:** retry shows cost/effect and uses idempotency.

## Admin validation matrix

| Screen | Primary action | Focus annotated | States | Compact | Wide |
|---|---:|---:|---:|---:|---:|
| A01 Login | PASS | PASS | PASS | PASS | PASS |
| A02 Dashboard | PASS | PASS | PASS | PASS | PASS |
| A03 Content | PASS | PASS | PASS | PASS | PASS |
| A04 Create | PASS | PASS | PASS | PASS | PASS |
| A05 Edit | PASS | PASS | PASS | PASS | PASS |
| A06 Chapters | PASS | PASS | PASS | PASS | PASS |
| A07 Translations | PASS | PASS | PASS | PASS | PASS |
| A08 Voice | PASS | PASS | PASS | PASS | PASS |
| A09 Processing | PASS | PASS | PASS | PASS | PASS |
| A10 Review | PASS | PASS | PASS | PASS | PASS |
| A11 Preview | PASS | PASS | PASS | PASS | PASS |
| A12 Publish | PASS | PASS | PASS | PASS | PASS |
| A13 History | PASS | PASS | PASS | PASS | PASS |
| A14 Errors | PASS | PASS | PASS | PASS | PASS |

## Admin walkthroughs

- Create -> save draft -> recover conflict: PASS.
- Structure -> translate -> configure voice: PASS.
- Process -> error -> retry: PASS.
- Review -> preview -> reject/approve: PASS.
- Approve -> confirm publish -> audit: PASS.
