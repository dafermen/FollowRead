# Versionado y releases

## Fuente de versión

Las releases usan SemVer mediante tags `vMAJOR.MINOR.PATCH`. El contenido editorial conserva su
propio versionado y no obliga a publicar otra aplicación.

- `PATCH`: corrección compatible;
- `MINOR`: funcionalidad compatible;
- `MAJOR`: cambio incompatible de contratos o datos.

## Preparación

```powershell
pnpm quality:regression
pnpm release:notes -- --version v0.1.0 --output release-notes.md
git tag -a v0.1.0 -m "FollowRead v0.1.0"
git push origin v0.1.0
```

Antes del tag, el repositorio GitHub debe tener:

- variable `FOLLOWREAD_API_BASE_URL` con URL HTTPS pública;
- GitHub Environment `release` con aprobación;
- permisos de Actions para publicar paquetes y releases;
- protección de `main`.

## Automatización

`.github/workflows/release.yml` vuelve a ejecutar calidad, seguridad y definición de despliegue;
construye tres imágenes, publica tags inmutables en GHCR, empaqueta los dos builds web y crea una
GitHub Release con notas generadas. `workflow_dispatch` sólo valida un candidato y no publica.

`.github/workflows/deployment-smoke.yml` valida URLs reales bajo los GitHub Environments
development, staging o production.

## Artefactos

- `followread-admin.tar.gz`;
- `followread-reader.tar.gz`;
- imágenes `api`, `admin` y `reader` en GHCR;
- `release-notes.md`;
- checksums/digests provistos por GitHub Actions y el registry.

Android/iOS conservan el proceso independiente de `MOBILE_RELEASES.md`; las firmas nunca pasan por
este workflow genérico.

