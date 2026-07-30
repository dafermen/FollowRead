# Licencias de terceros

FollowRead se publica como código fuente bajo la licencia MIT. Esa licencia sólo cubre el código y
los recursos originales de este repositorio; no sustituye las licencias de dependencias,
herramientas, SDK ni componentes de terceros.

Las versiones exactas se fijan en:

- `pnpm-lock.yaml` para el workspace JavaScript/TypeScript;
- `apps/api/pyproject.toml` para la API Python;
- los proyectos nativos de `apps/reader/android` y `apps/reader/ios` para Capacitor.

Las dependencias no se versionan dentro del repositorio: `node_modules`, entornos virtuales,
artefactos compilados y caches están excluidos. Cada distribución conserva los avisos y textos de
licencia incluidos por sus respectivos paquetes.

Antes de distribuir binarios, imágenes OCI, APK, IPA o instaladores se debe generar y aprobar el
inventario del artefacto concreto con nombre, versión, licencia, copyright y avisos exigidos. La
publicación del código fuente no equivale a esa aprobación de binarios.
