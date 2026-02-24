# Common Config

Configuración transversal de entorno, seguridad HTTP y Swagger.

## Subgrupos

- `environment/`: claves, defaults y validación Joi.
- `security/`: CORS, Helmet, permissions policy.
- `documentation/`: construcción de Swagger (`/docs`).
- `helpers/`: helpers de config (ej. validación de URL Redis).
- `common-config.module.ts`: módulo global de configuración.

## Contrato Público

- `CommonConfigModule`
- `ENV_KEYS`, `ENV_DEFAULTS`, `envValidationSchema`
- `buildSwaggerConfig`, `buildSwaggerUrl`
- `getCorsConfig`, `helmetConfig`, `helmetConfigDev`

## Regla

Si cambia una variable de entorno o política de seguridad, actualizar docs de `SECURITY.md` y `CONTRACTS.md` si aplica.
