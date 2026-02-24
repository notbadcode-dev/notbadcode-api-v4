# ENVIRONMENT

Matriz de variables de entorno del monorepo y su semántica operativa.

## Fuente De Verdad

- Claves: `libs/common/src/config/environment/env.keys.ts`
- Defaults: `libs/common/src/config/environment/env.default.ts`
- Validación: `libs/common/src/config/environment/env.validations.ts`

## Variables Obligatorias (Runtime)

- `AUTH_JWT_SECRET`
- `AUTH_DB_HOST`
- `AUTH_DB_PORT`
- `AUTH_DB_USER`
- `AUTH_DB_PASS`
- `AUTH_DB_NAME`
- `LINKS_DB_HOST`
- `LINKS_DB_PORT`
- `LINKS_DB_USER`
- `LINKS_DB_PASS`
- `LINKS_DB_NAME`

## Variables Con Default

- Servicio/puertos:
  - `AUTH_SERVICE_NAME` (`unknown-service`)
  - `AUTH_PORT` (`60200`)
  - `LINKS_SERVICE_NAME` (`unknown-service`)
  - `LINKS_PORT` (`60201`)
- JWT:
  - `AUTH_JWT_EXPIRES_IN` (`15m`)
  - `AUTH_JWT_REFRESH_EXPIRES_IN` (`7d`)
- Seguridad y red:
  - `CORS_ORIGINS` (`http://localhost:3000`)
  - `THROTTLE_TTL` (`60000`)
  - `THROTTLE_LIMIT` (`60`)
- SSL:
  - `SSL_KEY_PATH` (`certs/dev-key.pem`)
  - `SSL_CERT_PATH` (`certs/dev-cert.pem`)
- i18n:
  - `I18N_DIR` (`/app/libs/common/src/i18n`)
  - `FALLBACK_LANGUAGE` (`en`)
- Redis:
  - `REDIS_CACHE_URL` (`redis://redis:6379`)
  - `REDIS_CACHE_PASSWORD` (`''`)
  - `REDIS_SESSION_URL` (`redis://redis:6379`)
  - `REDIS_SESSION_PASSWORD` (`''`)

## Convenciones Importantes

- `AUTH_SERVICE_NAME` y `LINKS_SERVICE_NAME` son las variables usadas por logger para nombre de servicio.
- `SERVICE_NAME` en `.env.example` de apps es legacy y no forma parte de `ENV_KEYS`.
- URLs de Redis deben incluir índice DB (`/0`) según validación.
- `AUTH_JWT_SECRET` requiere longitud mínima de 32.

## Archivos `.env` Del Repo

- Raíz: `.env.example`
- Auth: `apps/auth/.env.example`
- Links: `apps/links/.env.example`

## Reglas De Cambio

- Si agregas o cambias una variable:
  1. actualizar `env.keys.ts`
  2. actualizar defaults/validación si aplica
  3. actualizar este documento
  4. ajustar `.env.example` afectados
