# Workflows

- `ci.yml`: calidad, seguridad, builds web, artefactos y construcción de tres imágenes.
- `release.yml`: candidato manual o release SemVer con GHCR, paquetes web y release notes.
- `deployment-smoke.yml`: smoke test manual bajo GitHub Environments protegidos.

El repositorio local todavía no tiene remote GitHub; la primera ejecución real es un gate externo de
Fase 13.
