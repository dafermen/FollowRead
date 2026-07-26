# Verificación E2E offline - Fase 9

## Preparación

```powershell
pnpm demo:seed
pnpm dev
pnpm offline:bootstrap
```

## Recorrido automatizado

```powershell
pnpm reader:offline-e2e
```

Chrome usa un perfil desechable y DevTools Protocol para:

1. abrir `/downloads` y comprobar el cuento incluido;
2. bloquear la red;
3. navegar al lector desde el shell cacheado;
4. comprobar texto, controles e indicador `Sin conexión`;
5. iniciar lectura y verificar una operación de progreso en IndexedDB;
6. restaurar la red y esperar confirmación hasta vaciar la cola.

Las capturas se generan en `var/e2e/phase9-downloads.png` y
`var/e2e/phase9-offline-reader.png`.

## Cobertura complementaria

- paquete válido, alterado e incompatible;
- catálogo local con API caída;
- actualización corrupta con rollback;
- operaciones agrupadas e idempotentes;
- contenido y anclaje inválidos;
- límites de 100 MB y 250 MB;
- API canónica y checksum de la respuesta exacta.
