# Contrato de errores de la API

## Formato

Los errores de negocio esperados usan siempre este contenedor:

```json
{
  "error": {
    "code": "content.not_found",
    "message": "The requested content is not available.",
    "details": {
      "slug": "missing-story"
    }
  }
}
```

- `code` es estable y está destinado a decisiones del cliente.
- `message` es una descripción segura para personas; no debe usarse como identificador.
- `details` contiene campos seguros y accionables, nunca trazas, secretos ni datos personales.

## Catálogo vigente

| Código | HTTP | Significado |
|---|---:|---|
| `catalog.invalid_query` | 422 | Paginación, categoría o slug no cumplen el contrato |
| `content.not_found` | 404 | El contenido no existe o no está disponible públicamente |

FastAPI conserva sus errores estructurales de validación para parámetros que no pueden convertirse
al tipo declarado. Los servicios generan los códigos anteriores para reglas semánticas.

## Reglas

1. Una ruta no inventa códigos: traduce un `DomainError` registrado.
2. El mismo fallo de negocio conserva código y estado HTTP entre endpoints.
3. Contenido borrador, inactivo o incompleto se comporta como no encontrado en la API pública.
4. Errores inesperados no se convierten en `DomainError`; la observabilidad de Fase 3 registra un
   identificador de solicitud sin devolver detalles internos.
