# OBSERVABILITY

Contrato de trazabilidad y logging transversal de la API.

## Correlation ID

- Header de entrada soportado: `x-correlation-id`.
- Si no viene en la request, se genera UUID automáticamente.
- El mismo valor se devuelve en la response.

## Request Context

`RequestContextService` guarda contexto request-scoped con `AsyncLocalStorage`:
- `correlationId`
- `userId` (si existe)
- `ip`
- `userAgent`

## Logging Interceptor

`LoggingInterceptor` (global) registra:
- log de entrada: método, URL, params, query, body saneado
- log de salida: status code, tiempo total, payload saneado

## Sanitización

Se redactan campos sensibles por patrón de nombre:
- `password`
- `token`
- `secret`
- `authorization`
- `apikey` / `api_key`
- `credit card` / `cvv` / `ssn`

## Logger Backend

- Winston + daily rotate file.
- Carpeta: `logs/`
- Archivos:
  - `app-%DATE%.log`
  - `error-%DATE%.log`
- Nivel por `LOG_LEVEL` (default `info`).

## Notas Operativas

- El interceptor es global en `apps/auth/src/main.ts` y `apps/links/src/main.ts`.
- Cambios en formato/headers/sanitización impactan debugging, auditoría y soporte.

## Reglas De Cambio

- Si cambias `x-correlation-id`, sanitización o formato de logs, actualizar este documento y tests de `libs/common/test/unit` relacionados.
