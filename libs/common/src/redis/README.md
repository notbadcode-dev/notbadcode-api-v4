# Common Redis

Módulos compartidos para cache y control de sesión.

## Subgrupos

- `cache/`
  - `common-cache.module.ts`
  - `cache-accessor.ts`
  - `decorators/cached.decorator.ts`
- `session/`
  - `common-session-control.module.ts`
  - `common-session-control.service.ts`
  - `user-session.model.ts`

## Contrato

- Cache y sesión usan stores/config separados.
- Sesión se resuelve por clave `session:<userId>:<sessionId>`.

## Regla

Cambios en semántica de sesión deben revisarse con `guards/jwt-auth.guard.ts` y `apps/auth` logout/refresh.
