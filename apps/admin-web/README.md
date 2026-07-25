# FollowRead Admin

Aplicación web independiente para creación, revisión, procesamiento y publicación de contenido.

## Comandos

- `pnpm --filter @followread/admin-web dev`
- `pnpm --filter @followread/admin-web test`
- `pnpm --filter @followread/admin-web build`

## Pantallas disponibles

- `/` Dashboard editorial;
- `/content` catálogo y filtros;
- `/content/new` creación de borradores;
- `/content/{id}/edit` editor bilingüe, recuperación e ilustraciones;
- `/processing` audio, voces, costos y diagnóstico;
- `/reviews` revisión, historial y publicación;
- `/documentation` instalación y operación dentro de la aplicación.

En desarrollo, si no existe una sesión, estas pantallas muestran una vista previa identificada con
datos de ejemplo para facilitar demostraciones visuales.
