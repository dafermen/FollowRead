# Próximos pasos

## Siguiente tarea exacta

**Descomponer y activar la Fase 7 - Motor de lectura**

### Objetivo de la próxima sesión

Convertir audio, párrafos y Speech Marks en un motor reusable y determinista para Reader.

### Orden de trabajo

1. Volver al prompt maestro y extraer todas las actividades y entregables de Fase 7.
2. Definir contratos del Reader Engine sin React.
3. Crear fixtures deterministas desde los Speech Marks producidos en Fase 6.
4. Descomponer pruebas de sincronización, búsqueda temporal y estados del reproductor.

## No hacer todavía

- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni llamadas AWS reales en pruebas.
- No mezclar todavía la interfaz Reader de Fase 8 dentro del motor de Fase 7.

## Comando recomendado

```powershell
pnpm check
```
