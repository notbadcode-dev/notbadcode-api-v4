# Common Guards

Infra de autenticación compartida (JWT + sesión).

## Archivos

- `common-auth-guard.module.ts`: registra JWT module y guard.
- `jwt-auth.guard.ts`: valida bearer token + sesión Redis.
- `jwt-config.service.ts`: resuelve opciones JWT desde config.
- `index.ts`: barrel público.

## Contrato De Seguridad

`JwtAuthGuard` exige:
- header `Authorization: Bearer <token>`
- token válido y tipo `ACCESS`
- sesión existente en Redis

## Regla

Cambios en guard deben sincronizarse con `docs/SECURITY.md`.
