# Integración de audio y Speech Marks

## Resultado de la Fase 6

FollowRead puede convertir una traducción estructurada en audio y marcas temporales sin acoplar el
dominio a Amazon Polly. El modo predeterminado del MVP es local, determinista y sin costo. El límite
AWS está implementado detrás del mismo contrato y sólo se activa explícitamente en un entorno que
disponga del SDK y credenciales.

## Flujo

1. Admin envía versión, idioma, voz y clave de idempotencia.
2. La API valida sesión, CSRF, permiso, traducción e idioma de la voz.
3. El servicio une los párrafos conservando sus rangos de caracteres.
4. Antes de procesar calcula `caracteres × 0.000004 USD` y aplica el límite configurado.
5. El texto se divide sin cortar palabras, con un máximo configurable por fragmento.
6. El adaptador genera audio y marcas de palabra. Las llamadas transitorias se intentan hasta tres
   veces.
7. Los tiempos y posiciones se acumulan y cada marca se vincula al párrafo que contiene su carácter.
8. El audio se guarda con checksum SHA-256 y el trabajo termina como completado o fallido.

## Adaptadores

- `FakePollyAdapter`: opción predeterminada. Produce datos reproducibles, no usa red y es adecuada
  para desarrollo, demostraciones y todas las pruebas automáticas.
- `AwsPollyAdapter`: realiza una solicitud MP3 y otra de Speech Marks a un cliente compatible con
  Amazon Polly. El cliente se crea de forma diferida sólo cuando el proveedor es `aws`.
- `OpenAITtsAdapter`: genera un MP3 con una voz natural y alinea las palabras con timestamps. La
  clave se lee exclusivamente desde `OPENAI_API_KEY` en la API.
- `RetryingPollyAdapter`: conserva un máximo de tres intentos por fragmento y propaga el error final
  para que quede diagnosticado en el trabajo.
- `LocalAudioStorage`: escribe en el directorio local configurado. El contrato permite sustituirlo
  por almacenamiento de objetos en una fase posterior.

## Seguridad y operación

- El navegador nunca recibe credenciales AWS ni invoca Polly directamente.
- El navegador tampoco recibe `OPENAI_API_KEY`: reproduce únicamente el MP3 publicado.
- Todas las mutaciones exigen cookie de sesión, permiso `content.process`, origen permitido y CSRF.
- La clave de idempotencia evita costos y archivos duplicados ante reenvíos.
- El límite de costo se evalúa antes de cualquier llamada al proveedor.
- Los errores guardados se limitan a 500 caracteres.
- Ninguna prueba automatizada usa una cuenta, secreto o llamada real de AWS.

## API administrativa

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/admin/voices` | voces compatibles por idioma |
| `GET` | `/admin/processing` | actividad y diagnóstico reciente |
| `POST` | `/admin/processing` | iniciar generación idempotente |
| `POST` | `/admin/processing/{id}/retry` | reintentar un fallo |
| `POST` | `/admin/processing/{id}/cancel` | cancelar un trabajo pendiente |

La pantalla `/processing` muestra idioma, voz, costo máximo, progreso, estado, error y acciones. En
desarrollo conserva una vista previa visual cuando la API no tiene una sesión activa.
