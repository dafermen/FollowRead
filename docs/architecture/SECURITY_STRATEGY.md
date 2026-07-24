# Estrategia inicial de seguridad y privacidad

**Estado:** Validada para Fase 0 - FR-PH00-TASK-006 COMPLETED.

## Principios

- negar por defecto;
- validar en el servidor;
- privilegio mínimo;
- secretos sólo en backend/entorno;
- datos mínimos y propósito explícito;
- auditoría sin registrar secretos ni contenido sensible innecesario;
- clientes y paquetes locales se consideran manipulables.

## Activos

- credenciales y sesiones;
- contenido no publicado;
- audio, imágenes y traducciones con derechos;
- progreso, favoritos y vocabulario;
- datos de menores si finalmente existen;
- claves AWS y base de datos;
- historial de auditoría.

## Amenazas iniciales

| Amenaza | Control inicial |
|---|---|
| Acceso a Admin sin permiso | Autenticación, RBAC, autorización por acción |
| Publicación inválida | Máquina de estados, transacción y auditoría |
| Credenciales AWS en cliente | Adaptadores sólo backend y escaneo de secretos |
| Paquete manipulado | HTTPS, checksum y manifiesto validado |
| IDOR en progreso/vocabulario | Propiedad verificada en API |
| Inyección | Pydantic, consultas parametrizadas y límites |
| Abuso de generación de audio | Permisos, cuotas, estimación y rate limit futuro |
| Logs con datos sensibles | Redacción y estructura definida |
| Cuenta infantil sin consentimiento | Prohibirla hasta decisión de producto/legal |

## Identidad y sesión

La tecnología final no está elegida. Los requisitos mínimos son almacenamiento seguro de contraseña si
es propia, tokens cortos, refresh rotatorio o sesión equivalente, revocación, protección CSRF cuando
aplique, rate limiting y recuperación segura.

## Autorización

Roles iniciales: `super_admin`, `content_admin`, `reviewer`, `reader`. El rol orienta permisos, pero API
verifica cada acción. Publicar y administrar usuarios serán permisos explícitos.

## Datos y privacidad

Antes de crear cuentas infantiles se definirá:

- base legal y consentimiento;
- relación tutor-perfil;
- edad y región;
- retención y eliminación;
- exportación;
- analítica permitida;
- soporte y recuperación.

FR-DEC-009 prohíbe cuentas personales y PII de menores en el MVP. La política completa se encuentra
en `docs/requirements/DATA_POLICY.md`.

## AWS

- credenciales mediante roles o variables seguras del backend;
- buckets privados y cifrado;
- permisos separados por entorno;
- URLs temporales de duración mínima si se usan;
- no usar recursos reales durante pruebas automatizadas;
- registrar IDs y resultados, no secretos.

## Sesiones y protección web

- hash Argon2id o estándar resistente vigente;
- sesiones/tokens de corta duración y revocables;
- refresh rotatorio o sesión servidor equivalente;
- protección CSRF cuando se usen cookies;
- CSP, HSTS y encabezados apropiados en producción;
- rate limiting para login, recuperación y procesamiento;
- mensajes de autenticación que no revelen existencia de cuenta.

## Dependencias y vulnerabilidades

- lockfiles obligatorios;
- revisión antes de agregar dependencia;
- escaneo en CI;
- parche crítico priorizado y registrado;
- artefactos reproducibles y procedencia verificable cuando la plataforma lo permita.

## Respuesta inicial a incidentes

1. contener acceso o detener publicación/procesamiento;
2. preservar evidencia segura;
3. rotar secretos afectados;
4. evaluar datos/contenido impactado;
5. restaurar desde estado verificado;
6. documentar causa, comunicación y prevención.

## Referencias relacionadas

- `docs/architecture/THREAT_MODEL.md`
- `docs/requirements/DATA_POLICY.md`
- `docs/requirements/NON_FUNCTIONAL_REQUIREMENTS.md`

## Validación

- Límites de confianza y activos definidos: PASS.
- Amenazas tienen control y prueba: PASS.
- Privacidad infantil tiene decisión explícita: PASS.
- Sesiones, secretos, auditoría y dependencias tienen estrategia: PASS.
