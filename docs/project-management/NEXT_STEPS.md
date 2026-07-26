# Próximos pasos

## Siguiente tarea exacta

**Descomponer y activar la Fase 9 - Descargas y modo offline**

### Objetivo de la próxima sesión

Definir tareas, contratos y pruebas para descargar versiones publicadas, validar checksum, activar
contenido offline y reconciliarlo cuando vuelva la conexión.

### Orden de trabajo

1. Relacionar actividades de Fase 9 con requisitos y criterios de salida.
2. Diseñar catálogo local, cuotas, checksum y activación atómica.
3. Implementar estados de descarga y administración del espacio.
4. Probar pérdida/recuperación de red y versiones obsoletas.

## No hacer todavía

- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni llamadas AWS reales en pruebas.
- No iniciar Capacitor antes de cerrar el modo offline web.

## Comando recomendado

```powershell
pnpm check
```
