# FollowRead Reader

Aplicación web/PWA independiente para biblioteca y lectura sincronizada. Será la única aplicación
frontend considerada para Capacitor en una fase posterior.

## Demostración local

Desde la raíz:

```powershell
pnpm migrate
pnpm demo:seed
pnpm dev
```

Abre `http://localhost:5174/` y entra en **El zorro y la luna**. El demostrador permite reproducir
la línea de tiempo, pausar, repetir palabra, saltar, cambiar capítulo, velocidad e idioma, y
recuperar el progreso. El audio es una simulación temporal local y todavía no reproduce voz.

## Comandos

- `pnpm --filter @followread/reader dev`
- `pnpm --filter @followread/reader test`
- `pnpm --filter @followread/reader build`

La Fase 7 entrega el motor completo y un corte visual demostrable. PWA, audio audible y biblioteca
completa continúan en la Fase 8.
