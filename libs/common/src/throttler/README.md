# Common Throttler

Módulo compartido de rate limiting global.

## Archivos

- `common-throttler.module.ts`: registra `ThrottlerGuard` como `APP_GUARD`.
- `index.ts`

## Variables

- `THROTTLE_TTL`
- `THROTTLE_LIMIT`

## Regla

Cambios de políticas de throttle deben reflejarse en `docs/SECURITY.md`.
