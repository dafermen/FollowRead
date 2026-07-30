# API Error Contract

## Format

Expected business errors always use this container:

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

- `code` is stable and intended for client decisions.
- `message` is a safe description for humans; it must not be used as an identifier.
- `details` contains safe and actionable fields, never traces, secrets, or personal data.

## Current catalog

| Code | HTTP | Meaning |
|---|---:|---|
| `catalog.invalid_query` | 422 | Pagination, category, or slug do not meet the contract |
| `content.not_found` | 404 | The content does not exist or is not publicly available |

FastAPI retains its structural validation errors for parameters that cannot be converted
to the declared type. Services produce the above codes for semantic rules.

## Rules

1. A route does not invent codes: it maps a registered `DomainError`.
2. The same business failure retains code and HTTP status across endpoints.
3. Draft, inactive, or incomplete content behaves as not found in the public API.
4. Unexpected errors are not converted into `DomainError`; Phase 3 observability logs a
   request identifier without returning internal details.
