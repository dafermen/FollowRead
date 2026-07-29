# ADR-0001: SQLite para el MVP

**Estado:** ACCEPTED  
**Fecha:** 2026-07-24  
**Decisión canónica:** FR-DEC-013

## Contexto

El MVP debe poder desarrollarse y demostrarse sin operar PostgreSQL ni contenedores.

## Decisión

SQLite es la base autoritativa del MVP mediante SQLAlchemy y Alembic. Las consultas deben evitar
dependencias innecesarias de SQLite para conservar una futura ruta de migración.

## Consecuencias

- desarrollo local con menos infraestructura;
- pruebas de integración contra SQLite real;
- backups de archivo con checksum e integridad;
- concurrencia y migración futura requieren validaciones específicas;
- PostgreSQL no puede introducirse como requisito del MVP sin una nueva decisión.

Véase [DECISIONS.md](../project-management/DECISIONS.md).
