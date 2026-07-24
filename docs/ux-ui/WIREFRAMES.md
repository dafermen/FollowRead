# Wireframes de FollowRead

**Estado:** Reader y Admin validados  
**Tarea Reader:** FR-PH01-TASK-003 - COMPLETED  
**Tarea Admin:** FR-PH01-TASK-004 - COMPLETED  
**Convención:** diagramas de baja fidelidad; no representan color, tipografía final ni dimensiones
exactas.

## Convenciones visuales

- `[ Acción ]`: botón o control.
- `( )`: selección única.
- `[x]`: preferencia activada.
- `...`: contenido variable.
- `!`: estado que necesita atención.
- Orden en el diagrama: orden de lectura y foco, salvo anotación.

## Shell Reader

### Compacto

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

### Amplio

```text
┌────────────┬─────────────────────────────────────┐
│ Logo       │ Título                   Estado     │
│ Inicio     ├─────────────────────────────────────┤
│ Biblioteca│ Contenido principal      Rail opc. │
│ Mi lectura│                                     │
│ Ajustes    │                                     │
└────────────┴─────────────────────────────────────┘
```

El shell no se muestra como navegación primaria durante lectura enfocada. El estado de conexión usa
texto/semántica además de icono.

---

## FR-SCREEN-R01 - Inicio

**Acción principal:** continuar la última lectura o elegir una recomendación.

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

- **Foco:** título -> continuar -> recomendados -> biblioteca -> navegación.
- **Estados:** nuevo (sin tarjeta continuar), offline (sólo local), progreso pendiente.
- **Amplio:** continuar ocupa columna principal; recomendaciones forman cuadrícula.

## FR-SCREEN-R02 - Biblioteca

**Acción principal:** elegir contenido.

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

- **Foco:** título -> búsqueda -> filtros -> resultados.
- **Estados:** vacía con limpiar filtros; error remoto conserva resultados locales; cargando incremental.
- **Amplio:** filtros en rail; resultados en cuadrícula adaptable.

## FR-SCREEN-R03 - Categorías

**Acción principal:** seleccionar una categoría.

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

- **Foco:** título -> categorías -> contenido.
- **Estados:** categoría sin resultados ofrece volver a todas; offline marca categorías sólo remotas.
- **Amplio:** categorías como lista lateral y resultados a la derecha.

## FR-SCREEN-R04 - Búsqueda

**Acción principal:** buscar por texto y abrir un resultado.

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

- **Foco:** campo -> buscar -> filtros -> resultados.
- **Estados:** inicial con sugerencias; sin resultados con corrección; error remoto con búsqueda local.
- **Anuncio:** conteo de resultados después de enviar, no en cada tecla.

## FR-SCREEN-R05 - Detalle

**Acción principal:** leer; descargar cuando aún no está local.

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

- **Foco:** volver -> título/metadatos -> leer -> descargar -> descripción.
- **Estados:** descargando, descargado, actualización, incompatible y retirado.
- **Amplio:** portada izquierda, datos/acciones derecha; descripción debajo.
- **Regla:** incompatible no ofrece leer/activar, pero explica versión requerida.

## FR-SCREEN-R06 - Lector

**Acción principal:** reproducir/controlar la lectura.

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

- **Foco:** salir -> modo/ajustes -> texto interactivo -> controles -> progreso.
- **Auto-scroll:** mueve contenido, nunca foco; mantiene palabra en zona segura.
- **Mano:** capa no interactiva debajo de palabra; se oculta por preferencia o reduced motion.
- **Infantil:** texto/controles 44px+, menos opciones visibles, mano por defecto, salida protegida.
- **Adulto:** mano oculta por defecto, tema/tamaño, controles sobrios.
- **Aprender inglés:** palabra tocable, traducción opcional, repetir palabra/oración, vocabulario.
- **Estados:** pausa, buffering, audio ausente, marcas inválidas, offline, orientación y fin de capítulo.
- **Amplio:** texto centrado con ancho legible; controles persistentes inferiores; rail de traducción
  sólo si hay espacio.

### Error recuperable del Lector

```text
│ ! No pudimos reproducir audio │
│ Tu posición está guardada.    │
│ [ Reintentar ] [ Leer texto ] │
│ Código: FR-AUDIO-...          │
```

## FR-SCREEN-R07 - Descargas

**Acción principal:** gestionar una descarga.

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

- **Foco:** título -> acción por elemento; progreso no recibe foco.
- **Estados:** cola, progreso, pausada, validando, completa, sin espacio, corrupta.
- **Regla:** eliminar local aclara que progreso/favorito no se eliminan.
- **Amplio:** lista con columnas de tamaño, versión, estado y acciones.

## FR-SCREEN-R08 - Favoritos

**Acción principal:** abrir un favorito.

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

- **Foco:** título -> filtro -> favorito -> abrir/quitar.
- **Estados:** vacío con explorar; cambio local pendiente; error de sincronización.
- **Confirmación:** quitar favorito es reversible mediante aviso, no diálogo bloqueante.

## FR-SCREEN-R09 - Historial

**Acción principal:** reanudar una lectura.

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

- **Foco:** título -> grupos cronológicos -> reanudar/leer de nuevo.
- **Estados:** vacío, local, sincronizado, conflicto explicable.
- **Regla:** muestra posición comprensible; el anclaje técnico no domina la UI.

## FR-SCREEN-R10 - Vocabulario

**Acción principal:** estudiar/abrir una palabra en contexto.

```text
┌──────────────────────────────┐
│ Mi vocabulario               │
│ [ Buscar palabra ] [Nivel]   │
│ fox /fɒks/         [▶]       │
│ zorro · "The little fox..."  │
│ [ Abrir contexto ] [ Quitar ]│
└──────────────────────────────┘
```

- **Foco:** búsqueda/filtro -> palabra -> audio -> contexto -> quitar.
- **Estados:** vacío, offline con audio local/no local, sincronización pendiente.
- **Regla:** significado y ejemplo son editoriales; no requiere IA.

## FR-SCREEN-R11 - Configuración

**Acción principal:** aplicar preferencias de lectura.

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

- **Foco:** grupos en orden -> vista previa -> guardar.
- **Estados:** valores del sistema, personalizados, error local y restablecer.
- **Regla:** cambio visual se previsualiza; reducir movimiento prevalece sobre animación.
- **Amplio:** formulario y vista previa lado a lado.

## FR-SCREEN-R12 - Perfil

**Acción principal:** elegir o gestionar el perfil de lectura.

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

- **Foco:** perfil activo -> cambiar -> borrar.
- **Infantil:** no pide nombre legal, email, edad ni ubicación.
- **Estados:** invitado/local, almacenamiento no disponible, borrado confirmado.
- **Regla:** borrar datos locales enumera progreso, descargas, preferencias y vocabulario afectados.

## Adaptación responsive

| Rango orientativo | Shell | Contenido | Controles |
|---|---|---|---|
| <600px | barra superior + nav inferior | una columna | ancho completo/44px infantil |
| 600-1023px | nav inferior o rail compacto | 1-2 columnas | agrupados por tarea |
| >=1024px | sidebar persistente | grid + rail opcional | contexto visible |

Los breakpoints finales se decidirán por reflow del contenido, no por modelo de dispositivo.

## Matriz de validación Reader

| Pantalla | Acción principal | Foco anotado | Estados | Compacto | Amplio |
|---|---:|---:|---:|---:|---:|
| R01 Inicio | PASS | PASS | PASS | PASS | PASS |
| R02 Biblioteca | PASS | PASS | PASS | PASS | PASS |
| R03 Categorías | PASS | PASS | PASS | PASS | PASS |
| R04 Búsqueda | PASS | PASS | PASS | PASS | PASS |
| R05 Detalle | PASS | PASS | PASS | PASS | PASS |
| R06 Lector | PASS | PASS | PASS | PASS | PASS |
| R07 Descargas | PASS | PASS | PASS | PASS | PASS |
| R08 Favoritos | PASS | PASS | PASS | PASS | PASS |
| R09 Historial | PASS | PASS | PASS | PASS | PASS |
| R10 Vocabulario | PASS | PASS | PASS | PASS | PASS |
| R11 Configuración | PASS | PASS | PASS | PASS | PASS |
| R12 Perfil | PASS | PASS | PASS | PASS | PASS |

## Walkthroughs Reader

- Descubrir -> detalle -> leer: PASS.
- Descargar -> validar -> leer offline: PASS.
- Reproducir -> repetir -> guardar progreso: PASS.
- Aprender inglés -> vocabulario -> contexto: PASS.
- Configurar modo/movimiento -> lector: PASS.
- Error audio/descarga -> recuperación segura: PASS.

---

# Wireframes Admin

## Shell Admin

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

En ancho compacto, la navegación se abre mediante botón con nombre accesible y se cierra devolviendo
foco al botón. Elementos sin permiso no se ofrecen, pero API siempre vuelve a autorizar.

| Rango orientativo | Navegación | Tablas/pares | Acciones |
|---|---|---|---|
| <600px | encabezado + drawer | tarjetas o pasos apilados | barra inferior contextual |
| 600-1023px | rail colapsable | grid flexible / dos paneles si caben | cabecera de sección |
| >=1024px | sidebar persistente | tablas y split panes | cabecera/rail contextual |

Diálogos peligrosos ocupan una superficie enfocada; en compacto pueden ser pantalla completa. Esta
regla responsive aplica a A01-A14 salvo una anotación más específica.

## FR-SCREEN-A01 - Login

**Acción principal:** iniciar sesión.

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

- **Foco:** título -> email -> contraseña -> mostrar -> iniciar.
- **Estados:** inicial, enviando, credencial inválida, rate limit, sesión expirada.
- **Amplio:** tarjeta centrada; no incluye navegación Admin antes de autenticar.

## FR-SCREEN-A02 - Dashboard

**Acción principal:** continuar el trabajo prioritario.

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

- **Foco:** título -> crear -> alertas/acciones -> recientes.
- **Estados:** vacío, cargando, alertas, permiso parcial.
- **Compacto:** tarjetas apiladas; una acción principal por tarjeta.

## FR-SCREEN-A03 - Lista de contenido

**Acción principal:** abrir o crear contenido.

```text
┌────────────────────────────────────────────┐
│ Contenido                 [ Crear ]         │
│ [Buscar] [Estado] [Tipo] [Idioma] [Nivel] │
│ Título   Tipo   Versión  Estado   Acción   │
│ Luna     story v3       draft    [Editar] │
│ Río      story v1       review   [Abrir]  │
└────────────────────────────────────────────┘
```

- **Foco:** título -> crear -> filtros -> filas/acciones.
- **Estados:** vacío con crear, sin resultados, error, permiso sólo lectura.
- **Compacto:** filas se convierten en tarjetas con etiqueta-valor.

## FR-SCREEN-A04 - Crear contenido

**Acción principal:** crear borrador.

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

- **Foco:** título -> campos -> resumen de errores -> crear.
- **Estados:** limpio, inválido, creando, error recuperable.
- **Regla:** no solicita audio/recursos antes de que exista borrador.

## FR-SCREEN-A05 - Editar contenido

**Acción principal:** guardar cambios válidos.

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

- **Foco:** estado guardado -> pestañas -> campos -> guardar/previsualizar.
- **Estados:** guardando, guardado, cambios locales, offline, error y conflicto.
- **Conflicto:** compara "tu versión" y "versión remota"; nunca sobrescribe automáticamente.
- **Compacto:** pestañas se vuelven selector/secciones; barra de guardado permanece visible.

## FR-SCREEN-A06 - Capítulos y párrafos

**Acción principal:** editar la estructura.

```text
┌───────────────┬────────────────────────────┐
│ Capítulos     │ Capítulo 1                 │
│ 1. Inicio     │ Párrafo 1 [_____________]  │
│ 2. El río     │ Párrafo 2 [_____________]  │
│ [+ Capítulo]  │ [+ Párrafo] [ Guardar ]    │
└───────────────┴────────────────────────────┘
```

- **Foco:** árbol -> agregar -> editor -> acciones; reordenar también funciona con teclado.
- **Estados:** vacío, seleccionado, reordenando, error de longitud, cambios pendientes.
- **Compacto:** lista de capítulos -> detalle en ruta secundaria con volver.

## FR-SCREEN-A07 - Traducciones

**Acción principal:** asociar texto inglés/español por unidad.

```text
┌─────────────────────┬──────────────────────┐
│ Inglés              │ Español              │
│ P1 The little fox…  │ P1 El pequeño zorro…│
│ P2 [missing]        │ P2 El río…           │
│ [ Alinear unidades ] [ Guardar ]           │
└─────────────────────┴──────────────────────┘
```

- **Foco:** unidad original -> traducción relacionada -> acciones.
- **Estados:** faltante, desalineada, completa, conflicto.
- **Accesibilidad:** relación no depende de columnas/color; IDs y encabezados anuncian pares.
- **Compacto:** pares apilados uno tras otro.

## FR-SCREEN-A08 - Configuración de voz

**Acción principal:** elegir voces válidas.

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

- **Foco:** voz/prueba por idioma -> velocidad -> estimación -> guardar.
- **Estados:** no elegida, incompatible, muestra cargando/error, válida.
- **Regla:** prueba y costo pasan por API; no hay credenciales AWS en Admin.

## FR-SCREEN-A09 - Procesamiento

**Acción principal:** procesar, cancelar o reintentar según estado.

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

- **Foco:** título/estado -> acciones -> detalle seguro.
- **Estados:** listo, cola, progreso, cancelando, fallido, parcial, completo, límite.
- **Fallo:** muestra recursos conservados y `[ Reintentar ]`; no duplica trabajo.
- **Compacto:** etapas apiladas; progreso conserva etiqueta textual.

## FR-SCREEN-A10 - Revisión

**Acción principal:** aprobar o rechazar con evidencia.

```text
┌────────────────────────────────────────────┐
│ Revisión · versión 3                       │
│ Checklist: texto ✓ audio ✓ marcas !        │
│ [ Abrir previsualización ]                 │
│ Comentario [________________________]      │
│ [ Rechazar ]              [ Aprobar ]      │
└────────────────────────────────────────────┘
```

- **Foco:** checklist -> preview -> comentario -> rechazar/aprobar.
- **Estados:** pendiente, defecto, comentario requerido, lista, permiso insuficiente.
- **Regla:** aprobar/rechazar produce transición auditada; color no es única señal.

## FR-SCREEN-A11 - Previsualización

**Acción principal:** comprobar la experiencia exacta del Reader.

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

- **Foco:** opciones de viewport/modo -> preview -> marcar/volver.
- **Estados:** audio ausente, marcas inválidas, recursos faltantes, válida.
- **Regla:** usa los mismos contratos/componentes de lectura, no una simulación desconectada.

## FR-SCREEN-A12 - Publicación

**Acción principal:** confirmar publicación de una versión aprobada.

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

- **Foco:** resumen -> cancelar -> publicar.
- **Estados:** bloqueada con razones, confirmación, publicando, publicada, error.
- **Regla:** requiere permiso; nunca ofrece publicar si faltan validaciones.

## FR-SCREEN-A13 - Historial y auditoría

**Acción principal:** investigar un cambio.

```text
┌────────────────────────────────────────────┐
│ Historial                                  │
│ [Fecha] [Actor] [Acción] [Resultado]       │
│ 10:42 Ana  approved v3   éxito [Detalle]  │
│ 10:10 Luis retry job 92  éxito [Detalle]  │
└────────────────────────────────────────────┘
```

- **Foco:** filtros -> eventos -> detalle.
- **Estados:** vacío, filtrado, cargando, evento retenido/expirado.
- **Regla:** detalle omite secretos y datos no necesarios.

## FR-SCREEN-A14 - Errores y trabajos

**Acción principal:** diagnosticar y recuperar.

```text
┌────────────────────────────────────────────┐
│ Trabajos y errores                         │
│ ! Job 92 · speech marks · failed           │
│ Código seguro · correlation ID · 10:10     │
│ Recursos: audio conservado / marcas no     │
│ [ Ver diagnóstico ] [ Reintentar ]         │
└────────────────────────────────────────────┘
```

- **Foco:** filtros -> trabajo -> diagnóstico/reintento.
- **Estados:** activo, fallido, cancelado, límite, recuperado.
- **Regla:** reintento muestra costo/efecto y usa idempotencia.

## Matriz de validación Admin

| Pantalla | Acción principal | Foco anotado | Estados | Compacto | Amplio |
|---|---:|---:|---:|---:|---:|
| A01 Login | PASS | PASS | PASS | PASS | PASS |
| A02 Dashboard | PASS | PASS | PASS | PASS | PASS |
| A03 Contenido | PASS | PASS | PASS | PASS | PASS |
| A04 Crear | PASS | PASS | PASS | PASS | PASS |
| A05 Editar | PASS | PASS | PASS | PASS | PASS |
| A06 Capítulos | PASS | PASS | PASS | PASS | PASS |
| A07 Traducciones | PASS | PASS | PASS | PASS | PASS |
| A08 Voz | PASS | PASS | PASS | PASS | PASS |
| A09 Procesamiento | PASS | PASS | PASS | PASS | PASS |
| A10 Revisión | PASS | PASS | PASS | PASS | PASS |
| A11 Preview | PASS | PASS | PASS | PASS | PASS |
| A12 Publicación | PASS | PASS | PASS | PASS | PASS |
| A13 Historial | PASS | PASS | PASS | PASS | PASS |
| A14 Errores | PASS | PASS | PASS | PASS | PASS |

## Walkthroughs Admin

- Crear -> guardar borrador -> recuperar conflicto: PASS.
- Estructurar -> traducir -> configurar voz: PASS.
- Procesar -> error -> reintentar: PASS.
- Revisar -> previsualizar -> rechazar/aprobar: PASS.
- Aprobar -> confirmar publicación -> auditar: PASS.
