# Arquitectura de modo offline

## Flujo de contenido

1. La API serializa el paquete Reader con orden y separadores canónicos.
2. Publicación y siembra guardan `sha256:<hex>` sobre esos bytes exactos.
3. Reader combina catálogo remoto con registros activos de IndexedDB.
4. Una descarga se valida completamente antes de una escritura atómica.
5. Una actualización fallida deja intacta la versión anterior.

`localStorage` no contiene paquetes. IndexedDB almacena texto, marcas, metadatos y operaciones; el
Cache Storage conserva el shell y portadas recuperables.

## Estados visibles

- `remote`: disponible en línea y descargable;
- `downloaded`: listo sin conexión;
- `update_available`: existe una versión o checksum distinto;
- `local_only`: el paquete continúa local aunque desaparezca del catálogo;
- `incompatible`: requiere una versión posterior de FollowRead;
- `failed`: reservado para una descarga que necesita recuperación.

La pantalla `/downloads` informa cantidad, espacio, origen incluido/descargado, actualización y
eliminación. Los indicadores del shell y del lector anuncian conexión y sincronización con texto.

## Integridad y almacenamiento

- SHA-256 se calcula con Web Crypto sobre el texto UTF-8 exacto.
- Menos de 100 MB: descarga normal.
- Desde 100 MB: confirmación antes de guardar.
- Más de 250 MB: rechazo.
- Una estimación de cuota insuficiente también rechaza sin reemplazar el registro activo.

## Progreso

Reader agrupa el progreso pendiente por contenido. `POST /reader/sync` acepta hasta 100 operaciones,
valida contenido y anclaje, confirma reenvíos y nunca aplica una posición anterior a la registrada.
El identificador local del dispositivo es aleatorio y no contiene PII.

## Operación local

Después de publicar o modificar el cuento demo:

```powershell
pnpm demo:seed
pnpm dev
pnpm offline:bootstrap
```

El último comando exige que la API local esté activa y falla si algún checksum no coincide.
