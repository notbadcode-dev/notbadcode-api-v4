# Common Auth

Contratos de tipos JWT compartidos entre apps.

## Archivos

- `jwt-type.enum.ts`: distingue tipo de token (`ACCESS`/`REFRESH`).
- `jwt-payload-plain.type.ts`: shape base del payload JWT.
- `index.ts`: barrel público del subgrupo.

## Consumidores

- `guards/jwt-auth.guard.ts`
- handlers de auth en `apps/auth/src/application/handlers/*`

## Regla

Si cambia un claim o enum JWT, validar impacto en guard, auth handlers y docs de seguridad.
