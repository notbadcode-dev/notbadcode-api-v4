# Common Filters

Filtros globales para normalizar errores en el envelope API.

## Archivos

- `global-exception.filter.ts`
- `validation-error-response.filter.ts`
- `index.ts`

## Contrato

Todos los errores se devuelven con forma `ApiFailureResponse`:
- `success: false`
- `data: null`
- `messageList`

## Regla

No cambiar forma de error sin actualizar `docs/CONTRACTS.md`.
