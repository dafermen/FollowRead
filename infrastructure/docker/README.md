# Docker diferido

Docker no es requisito del MVP. La base local y de demostración usa SQLite mediante la biblioteca
estándar de Python y no necesita un servicio externo.

Este directorio se conserva para una evolución futura a PostgreSQL o para empaquetar servicios de
despliegue cuando exista una necesidad operativa demostrada. No debe reintroducirse Docker en las
puertas del MVP sin una decisión nueva y pruebas de migración SQLite -> PostgreSQL.
