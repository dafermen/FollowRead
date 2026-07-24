# Perfiles de usuario y partes interesadas

**Estado:** Validado para Fase 0  
**Tarea responsable:** FR-PH00-TASK-003 - COMPLETED  
**Fecha:** 2026-07-24

## Conceptos

- **Persona:** individuo que interactúa o se beneficia del producto.
- **Usuario:** persona que realiza acciones en Reader, Admin o API.
- **Cuenta:** identidad autenticable; una persona puede usar Reader sin cuenta en el MVP.
- **Perfil:** preferencias y progreso de lectura asociados localmente o a una cuenta.
- **Rol:** conjunto de permisos del sistema, no una descripción demográfica.
- **Parte interesada:** persona responsable o afectada que puede no usar el producto directamente.

Esta distinción evita suponer que un lector infantil necesita cuenta propia.

## FR-PERSONA-001 - Lector infantil acompañado

- **Tipo:** Beneficiario primario.
- **Contexto:** Niño que lee solo o acompañado, en sesiones breves y con experiencia digital variable.
- **Objetivo:** Seguir una historia sin perder la palabra activa y controlar acciones básicas.
- **Barreras:** Demasiados controles, texto pequeño, navegación accidental, movimiento excesivo,
  dependencia de red y mensajes abstractos.
- **Necesidades:** Tipografía y objetivos grandes, acción principal visible, mano opcional, audio,
  progreso automático, salida segura y contenido apropiado.
- **Accesibilidad:** No depender sólo de color; compatibilidad con reducción de movimiento; lectura
  completa aunque falle la mano o el audio.
- **Cuenta/datos:** En el MVP usa perfil local o sesión gestionada por un adulto, sin cuenta ni datos
  personales propios.
- **Resultado esperado:** Puede iniciar, pausar y retomar una historia con mínima ayuda.
- **Modos:** infantil, español, inglés.
- **Resultados de visión:** FR-OV-001, FR-OV-003, FR-OV-004, FR-OV-006.

## FR-PERSONA-002 - Estudiante de inglés

- **Tipo:** Beneficiario primario.
- **Contexto:** Adolescente o adulto que comprende texto básico y necesita relacionar sonido,
  escritura y significado.
- **Objetivo:** Escuchar, repetir y estudiar unidades exactas sin abandonar el contexto.
- **Barreras:** Velocidad alta, traducciones descontextualizadas, navegación entre varias pantallas y
  pérdida de vocabulario guardado.
- **Necesidades:** Texto inglés principal, traducción editorial opcional, repetición de palabra/oración,
  velocidad, vocabulario y progreso.
- **Accesibilidad:** Teclado, lector de pantalla, ajustes de texto y movimiento.
- **Cuenta/datos:** Puede iniciar como perfil local; una cuenta futura habilita sincronización.
- **Resultado esperado:** Repite una unidad, ajusta velocidad y guarda vocabulario dentro del lector.
- **Modos:** aprender inglés, inglés.
- **Resultados de visión:** FR-OV-001, FR-OV-002, FR-OV-003, FR-OV-007.

## FR-PERSONA-003 - Lector adulto

- **Tipo:** Beneficiario primario.
- **Contexto:** Adulto que alterna lectura y narración, usa sesiones largas o necesita apoyo visual.
- **Objetivo:** Consumir contenido con una presentación sobria, adaptable y confiable.
- **Barreras:** Interfaz infantilizada, mano obligatoria, contraste insuficiente, pérdida de posición y
  controles que desaparecen.
- **Necesidades:** Mano opcional, tamaño/tema configurables, favoritos, historial, velocidad y offline.
- **Accesibilidad:** Zoom, reflow, teclado, lector de pantalla y controles persistentes.
- **Cuenta/datos:** Perfil local en MVP; sincronización autenticada se añade sin impedir uso offline.
- **Resultado esperado:** Completa y reanuda lecturas con sus preferencias.
- **Modos:** adulto, español, inglés.
- **Resultados de visión:** FR-OV-001, FR-OV-003, FR-OV-004, FR-OV-006.

## FR-PERSONA-004 - Tutor, familiar o docente

- **Tipo:** Parte interesada de apoyo.
- **Contexto:** Acompaña a un lector y selecciona contenido o configuración apropiada.
- **Objetivo:** Iniciar una experiencia segura sin administrar infraestructura ni contenido editorial.
- **Barreras:** Controles peligrosos accesibles, cuentas infantiles ambiguas y progreso difícil de
  interpretar.
- **Necesidades:** Separación absoluta de Admin, salida segura, información clara y perfiles locales.
- **Accesibilidad:** Instrucciones comprensibles y controles operables con diversas capacidades.
- **Cuenta/datos:** No se asume portal de tutor en MVP.
- **Resultado esperado:** Configura una sesión apropiada sin exponer administración.

## FR-PERSONA-005 - Editor de contenido

- **Tipo:** Usuario habilitador.
- **Rol esperado:** `content_admin`.
- **Contexto:** Prepara texto estructurado, traducciones y metadatos durante sesiones extensas.
- **Objetivo:** Crear contenido correcto sin perder trabajo.
- **Barreras:** Formularios ambiguos, errores tardíos, autoguardado invisible y edición bilingüe
  desalineada.
- **Necesidades:** Borradores, validación temprana, estados de guardado, estructura clara y vista
  bilingüe.
- **Accesibilidad:** Teclado completo, etiquetas, errores asociados y foco predecible.
- **Resultado esperado:** Deja una versión lista para procesamiento con validaciones satisfechas.

## FR-PERSONA-006 - Revisor y publicador

- **Tipo:** Usuario habilitador.
- **Roles esperados:** `reviewer` y permiso explícito de publicación.
- **Contexto:** Revisa texto, audio, sincronización, derechos y compatibilidad antes de publicar.
- **Objetivo:** Evitar que una versión defectuosa llegue al catálogo.
- **Barreras:** Estados opacos, reproducción distinta a Reader y falta de historial.
- **Necesidades:** Previsualización fiel, lista de validaciones, comentarios, rechazo y auditoría.
- **Accesibilidad:** Comparación que no dependa sólo de color; reproducción controlable por teclado.
- **Resultado esperado:** Aprueba o rechaza con evidencia y transición válida.

## FR-PERSONA-007 - Operador técnico

- **Tipo:** Usuario habilitador / parte interesada.
- **Rol esperado:** `super_admin` o permiso operativo limitado.
- **Contexto:** Investiga trabajos, integraciones, almacenamiento y errores.
- **Objetivo:** Recuperar el servicio sin alterar contenido silenciosamente.
- **Barreras:** Logs sin correlación, errores inseguros, reintentos duplicados y costos invisibles.
- **Necesidades:** Correlation IDs, estado de trabajos, reintento idempotente, métricas y auditoría.
- **Accesibilidad:** Paneles con estructura semántica y estados textuales.
- **Resultado esperado:** Diagnostica la etapa fallida y ejecuta una recuperación segura.

## Matriz de cobertura

| Necesidad | Infantil | Inglés | Adulto | Tutor | Editor | Revisor | Operador |
|---|---:|---:|---:|---:|---:|---:|---:|
| Audio y resaltado | X | X | X |  |  | X |  |
| Progreso/offline | X | X | X | X |  |  |  |
| Ajustes accesibles | X | X | X | X | X | X | X |
| Traducción/vocabulario |  | X |  |  | X | X |  |
| Borrador y validación |  |  |  |  | X | X |  |
| Publicación y auditoría |  |  |  |  |  | X | X |
| Diagnóstico y reintento |  |  |  |  |  |  | X |

## Validación

- Todos los modos de lectura tienen al menos un perfil: PASS.
- Cada perfil contiene contexto, objetivo, barrera, accesibilidad y resultado: PASS.
- Persona, cuenta, perfil, rol y parte interesada se distinguen: PASS.
- El rol del adulto responsable está definido sin inventar una cuenta infantil: PASS.
