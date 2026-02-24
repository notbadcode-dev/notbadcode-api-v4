# Common Decorators

Decoradores de extracción de datos HTTP para endpoints.

## Archivos

- `current-user-id.decorator.ts`
- `current-access-token.decorator.ts`
- `index.ts`

## Contrato

Asumen que el guard JWT pobló `request.user` y/o que el header bearer existe.

## Regla

Si cambias shape de `request.user` en guards, revisar estos decoradores en la misma PR.
