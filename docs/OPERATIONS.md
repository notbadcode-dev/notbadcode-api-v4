# OPERATIONS

Runbook operativo para desarrollo y ejecución con Docker.

## Modos De Ejecución

- Local sin Docker:
  - `npm run start:auth:dev`
  - `npm run start:links:dev`
- Docker debug (`docker-compose.override.yml`):
  - `npm run docker:up:debug`
- Docker prod (`docker-compose.yml` profile `prod`):
  - `npm run docker:up:prod`

## Puertos

- Auth API: `60200`
- Links API: `60201`
- Auth debug inspector: `9229`
- Links debug inspector: `9230`
- MariaDB: `3306`
- Redis cache: `63791`
- Redis session: `63792`

## Health Checks

- Auth: `GET /healthz`
- Links: `GET /healthz`

## Swagger

- Auth: `http://localhost:60200/docs`
- Links: `http://localhost:60201/docs`

## Seeds En Debug

El perfil debug ejecuta `seed` sobre MariaDB:
- `docker/seed/auth_dev_seed.sql`
- `docker/seed/links_dev_seed.sql`

## Dependencias Operativas

- `auth` depende de MariaDB + Redis cache + Redis session.
- `links` depende de MariaDB + Redis cache + Redis session + `auth` (en debug).

## Observaciones Importantes

- En desarrollo, la app abre Swagger automáticamente (`open(...)` en `main.ts`).
- En producción, si `NODE_ENV=production`, se habilita HTTPS con `SSL_KEY_PATH` y `SSL_CERT_PATH`.
- i18n en contenedor usa:
  - debug: `/app/libs/common/src/i18n`
  - prod: `/app/dist/libs/common/src/i18n`

## Reglas De Cambio

- Si cambias puertos/perfiles/dependencias de compose, actualiza este documento y `README.md` en la misma PR.
