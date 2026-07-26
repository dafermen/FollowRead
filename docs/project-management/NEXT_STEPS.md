# Próximos pasos

## Siguiente tarea exacta

**Descomponer y activar la Fase 8 - FollowRead Reader Web**

### Objetivo de la próxima sesión

Convertir el corte visual actual en una PWA accesible con audio audible y biblioteca completa.

### Orden de trabajo

1. Volver al prompt maestro y extraer todas las actividades y entregables de Fase 8.
2. Diseñar el límite entre `HTMLAudioElement` y el Reader Engine.
3. Completar estados, filtros y accesibilidad de la biblioteca.
4. Añadir manifest, service worker y estrategia instalable sin adelantar descargas de Fase 9.

## No hacer todavía

- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni llamadas AWS reales en pruebas.
- No mezclar almacenamiento web, React ni audio del navegador dentro del Reader Engine.

## Comando recomendado

```powershell
pnpm check
```
