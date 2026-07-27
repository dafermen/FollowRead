# Registro de decisiones

Este archivo registra decisiones aceptadas y preguntas que todavía necesitan resolución.

## Decisiones aceptadas

### FR-DEC-001 - Separación obligatoria de aplicaciones

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** FollowRead usará un monorepo, pero Admin, Reader y API serán aplicaciones
  independientes. Admin nunca se incluirá en el paquete Capacitor.
- **Razón:** Evita exponer administración en dispositivos y conserva límites claros.
- **Consecuencias:** Los elementos compartidos vivirán en paquetes explícitos; no se compartirán
  pantallas ni lógica específica de permisos por conveniencia.
- **Fuente:** Prompt maestro, secciones 3 y 5.

### FR-DEC-002 - Contenido mediante doble catálogo

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** Reader combinará un catálogo local incluido en el build con un catálogo remoto
  versionado. Una actualización de contenido no requerirá un nuevo build.
- **Razón:** Permite inicio offline y publicación dinámica.
- **Consecuencias:** Cada paquete requiere versión, compatibilidad, checksum y descarga atómica.

### FR-DEC-003 - Reader Engine sin dependencia de interfaz

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** La sincronización, el cálculo de palabra activa y el control de reproducción estarán
  en `packages/reader-engine`, desacoplados de React y de componentes visuales.
- **Razón:** Facilita pruebas deterministas y reutilización web/móvil.

### FR-DEC-004 - AWS sólo detrás de la API

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** Polly y S3 sólo se usarán desde adaptadores del backend. Controladores HTTP,
  frontends y paquetes compartidos no conocerán credenciales ni SDK de AWS.
- **Razón:** Seguridad, testabilidad y capacidad de sustitución.

### FR-DEC-005 - Idioma de documentación

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** La documentación de producto se escribirá principalmente en español; nombres de
  código, rutas, identificadores y contratos públicos usarán inglés.
- **Razón:** El promotor del proyecto trabaja en español y el código debe ser accesible para una
  audiencia técnica amplia.

### FR-DEC-006 - Jerarquía de audiencias por relación con el valor

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** Niños, estudiantes de inglés y adultos son segmentos beneficiarios del lector.
  Editores, revisores y administradores son usuarios habilitadores; tutores, familias, docentes y
  responsables de operación son partes interesadas de apoyo.
- **Razón:** Los segmentos lectores comparten el problema de seguir audio y texto, mientras los
  usuarios editoriales resuelven un flujo diferente que habilita ese valor.
- **Consecuencias:** FR-PH00-TASK-003 definirá perfiles separados sin crear aplicaciones Reader
  distintas. El modo infantil no implicará una cuenta infantil hasta resolver FR-DEC-OPEN-002.

### FR-DEC-007 - `document` se representa como `article`

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** El catálogo conserva `story`, `article`, `book` y `lesson`. Un documento se modela
  como `article` mientras no exista comportamiento propio que justifique un quinto tipo.
- **Razón:** Evita dos tipos indistinguibles y respeta la lista explícita del prompt.
- **Consecuencias:** Un caso futuro puede proponer otro tipo mediante migración y decisión registrada.

### FR-DEC-008 - Traducciones editoriales en el MVP

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** Traducciones, significados contextuales y ejemplos esenciales se almacenan como
  contenido editorial versionado. No dependen de IA ni de un servicio externo.
- **Razón:** Calidad revisable, derechos claros y funcionamiento offline.
- **Consecuencias:** Un proveedor futuro será opcional y no sustituirá contenido sin revisión.

### FR-DEC-009 - Sin cuentas personales de menores en el MVP

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** El modo infantil usa un perfil local o supervisado; no recopila identidad, correo,
  fecha de nacimiento ni analítica personal del menor.
- **Razón:** Permite una experiencia infantil sin inventar un modelo legal de consentimiento.
- **Consecuencias:** Una cuenta infantil futura exige revisión de privacidad, región, consentimiento,
  retención y eliminación.

### FR-DEC-010 - Notas libres después del MVP

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** El MVP incluye favoritos, historial y progreso. Las notas libres y marcadores
  enriquecidos del modo adulto quedan en el roadmap.
- **Razón:** Reduce datos personales, sincronización y conflictos sin perder el flujo central.

### FR-DEC-011 - pnpm workspaces sin orquestador adicional

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** El monorepo JavaScript/TypeScript usará pnpm workspaces. La API conservará su
  entorno Python mediante `pyproject.toml`. No se incorpora Nx ni Turborepo en la Fase 2.
- **Razón:** Los workspaces cubren los límites y comandos iniciales con menos configuración y menor
  superficie de actualización. Un orquestador podrá proponerse cuando exista evidencia de tiempos
  de build o dependencias que lo justifiquen.
- **Consecuencias:** Los scripts raíz coordinan aplicaciones y paquetes; las dependencias internas
  se declaran con `workspace:*`; las versiones de Node, pnpm y Python quedan documentadas.

### FR-DEC-012 - PostgreSQL 18.4 oficial para desarrollo local

- **Fecha:** 2026-07-24
- **Estado:** SUPERSEDED_BY_FR-DEC-013
- **Decisión:** El entorno local usa la imagen oficial `postgres:18.4-alpine3.24`, con datos
  persistidos en `/var/lib/postgresql`, puerto limitado a loopback y salud mediante `pg_isready`.
- **Razón:** PostgreSQL 18.4 es la versión estable actual y la imagen oficial cambió en la versión 18
  la raíz persistente recomendada a `/var/lib/postgresql`.
- **Consecuencias:** El tag de parche se actualiza de forma deliberada; no se usa `latest`; los
  upgrades mayores requieren plan y prueba de migración.

### FR-DEC-013 - SQLite sustituye PostgreSQL en el MVP

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** El MVP usa SQLite como base autoritativa mediante SQLAlchemy y Alembic. No requiere
  Docker. PostgreSQL queda fuera del MVP y podrá retomarse cuando exista capacidad operativa o una
  necesidad demostrada de concurrencia/escala.
- **Razón:** El propietario confirmó que no dispone de PostgreSQL para este MVP y autorizó continuar
  con SQLite.
- **Consecuencias:** La API es la única propietaria del archivo; tests usan archivos temporales; se
  evitan extensiones específicas de SQLite cuando impidan portabilidad; una migración futura a
  PostgreSQL exige decisión, exportación/importación y pruebas de integridad.

### FR-DEC-014 - Sesiones opacas revocables para el Admin MVP

- **Fecha:** 2026-07-24
- **Estado:** ACCEPTED
- **Decisión:** Las cuentas adultas/editoriales usan contraseña con Argon2id y sesiones opacas
  aleatorias. La API persiste sólo el hash del token y lo entrega en cookie host-only `HttpOnly`,
  `SameSite=Strict` y `Secure` en producción. No se guardan JWT, refresh tokens ni credenciales en
  `localStorage`/`sessionStorage`.
- **Protecciones:** expiración inactiva de 30 minutos, absoluta de 8 horas, revocación en logout,
  rotación al autenticar/cambiar privilegios, `Cache-Control: no-store`, verificación CSRF y origen
  para métodos inseguros, mensajes que no enumeran cuentas y límites de intentos.
- **Alcance:** recuperación de contraseña y cuentas de menores permanecen fuera del MVP. El primer
  superadministrador se crea mediante comando local explícito, nunca mediante credenciales seed.
- **Razón:** simplifica revocación y evita credenciales accesibles a JavaScript. Sigue las guías
  actuales de OWASP para Argon2id, cookies de sesión y CSRF.
- **Referencias:** [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html),
  [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html),
  [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

### FR-DEC-015 - Adaptador móvil mínimo y sin audio en segundo plano

- **Fecha:** 2026-07-26
- **Estado:** ACCEPTED
- **Decisión:** Capacitor empaqueta sólo Reader. App, Network, Splash Screen y Status Bar son los
  únicos plugins de Fase 10. IndexedDB/`localStorage` continúan como almacenamiento. Web Speech se
  pausa en segundo plano y no se declaran servicios Android ni `UIBackgroundModes`.
- **Razón:** La experiencia existente ya es offline, evita permisos de archivos y no dispone de una
  fuente de audio nativa continua. Declarar reproducción en fondo sería engañoso.
- **Consecuencias:** Audio nativo futuro requiere otra decisión, controles del sistema, foco de
  audio, interrupciones, batería y pruebas de tienda. Cualquier secreto requerirá almacenamiento
  cifrado nativo; los datos no sensibles actuales no.

### FR-DEC-016 - Apoyos educativos deterministas desde el paquete bilingüe

- **Fecha:** 2026-07-26
- **Estado:** ACCEPTED
- **Decisión:** El modo aprendizaje obtiene traducción, significado y ejemplos esenciales desde
  párrafos bilingües pareados por `stable_key` y Speech Marks del paquete publicado. La alineación
  relativa de palabra es un fallback explícito del MVP.
- **Razón:** Permite aprendizaje offline, conserva revisión editorial y cumple la prohibición de
  depender inicialmente de IA.
- **Consecuencias:** Acepciones complejas requerirán un glosario o alineación editorial versionada.
  Una integración futura con IA sólo puede ser opcional, identificada y degradable.

### FR-DEC-017 - Observabilidad local, agregada y sin contenido personal

- **Fecha:** 2026-07-26
- **Estado:** ACCEPTED
- **Decisión:** API, Admin y Reader producen señales operativas mínimas sin enviar datos a terceros.
  Logs, métricas y errores excluyen cuerpos, query strings, cookies, tokens, texto, vocabulario y
  datos del menor. Las rutas se normalizan para evitar cardinalidad no controlada.
- **Razón:** Permite diagnosticar estabilidad sin crear una nueva superficie de privacidad.
- **Consecuencias:** La Fase 13 podrá conectar un colector, pero deberá mantener redacción,
  retención, acceso restringido a `/metrics` y separación por ambiente.

### FR-DEC-018 - Caché explícita según sensibilidad y mutabilidad

- **Fecha:** 2026-07-26
- **Estado:** ACCEPTED
- **Decisión:** Autenticación, administración, sincronización y operaciones usan `no-store`;
  catálogo público usa caché corta y paquetes se revalidan con ETag. Reader aplica network-first a
  navegación, cache-first a assets versionados y stale-while-revalidate a recursos secundarios.
- **Razón:** Mejora tiempo de respuesta y offline sin almacenar respuestas sensibles o servir
  contenido editorial indefinidamente obsoleto.
- **Consecuencias:** Un CDN futuro deberá conservar estas reglas y probar invalidación al publicar.

## Decisiones abiertas

### FR-DEC-OPEN-004 - Estrategia de licenciamiento del repositorio

- **Estado:** OPEN
- **Dueño:** Product Owner
- **Fecha objetivo:** Antes de iniciar Fase 14
- **Pregunta:** ¿El proyecto será público y qué licencia se usará?
- **Recomendación inicial:** No crear `LICENSE` hasta que el propietario elija explícitamente.
- **Resolver antes de:** Fase 14.
