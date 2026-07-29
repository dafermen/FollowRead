# ADR-0002: Contenedores opcionales y artefactos neutrales

**Estado:** ACCEPTED  
**Fecha:** 2026-07-26  
**Decisión canónica:** FR-DEC-019

## Contexto

El proyecto necesita empaquetado reproducible sin convertir Docker ni un proveedor cloud en
requisitos del desarrollo local.

## Decisión

`pnpm dev` continúa como ruta principal. Docker empaqueta API, Admin y Reader para CI y despliegue.
Los artefactos no seleccionan un proveedor y usan configuración externa.

## Consecuencias

- desarrollo local independiente de Docker;
- tres imágenes versionadas y validables;
- Docker real, GitHub y staging siguen siendo gates de la Fase 13;
- elegir proveedor o desplegar production requiere autorización explícita.

Véase [DECISIONS.md](../project-management/DECISIONS.md).
