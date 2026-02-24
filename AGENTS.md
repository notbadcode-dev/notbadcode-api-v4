# AGENTS

Este archivo es el punto de entrada para cualquier agente de IA que trabaje en este repositorio.

## Orden De Lectura

1. `AGENTS.md` (este archivo)
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)
4. [`docs/CONTRACTS.md`](docs/CONTRACTS.md)
5. [`docs/SECURITY.md`](docs/SECURITY.md)
6. [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)
7. [`docs/OPERATIONS.md`](docs/OPERATIONS.md)
8. [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md)
9. [`docs/FEATURES/README.md`](docs/FEATURES/README.md) + archivo específico de la feature a tocar

## Objetivo Del Proyecto

Monorepo backend NestJS (`notbadcode-api-v4`) con:
- microservicio `auth` (registro/login/logout/refresh)
- microservicio `links` (links y group-links)
- librería compartida `libs/common` para seguridad, configuración, respuestas, i18n, cache/sesiones y utilidades

## Comandos Rápidos

- `npm run start:auth:dev`: levantar Auth en local
- `npm run start:links:dev`: levantar Links en local
- `npm run lint`: lint TypeScript
- `npm run test`: tests del monorepo
- `npm run test:auth`: tests de Auth
- `npm run test:links`: tests de Links
- `npm run test:common`: tests de `libs/common`
- `npm run build`: build de proyectos Nest

## Reglas Operativas Para Agentes

- No romper el contrato envelope de respuestas (`success`, `data`, `messageList`, `code`).
- Mantener DTOs validados con `class-validator` y `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- Respetar aliases de `tsconfig.base.json` (`@apps/auth/*`, `@apps/links/*`, `@common/*`, `@test/*`).
- En endpoints protegidos, mantener `@UseGuards(JwtAuthGuard)` + extracción de `@CurrentUserId()` cuando aplique.
- Si cambias seguridad, auth o sesiones, actualiza [`docs/SECURITY.md`](docs/SECURITY.md) en la misma PR.
- Si cambias contratos request/response, actualiza [`docs/CONTRACTS.md`](docs/CONTRACTS.md) y el archivo de feature afectada.
- Si cambias configuración de entorno o docker/perfiles, actualiza [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) y [`docs/OPERATIONS.md`](docs/OPERATIONS.md).
- Si cambias logging/correlación/sanitización, actualiza [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md).
- Hacer cambios pequeños y verificables; ejecutar al menos lint + tests del scope tocado cuando sea posible.

## Fuente De Verdad (Si Hay Conflicto)

Prioridad de decisión:

1. [`docs/CONTRACTS.md`](docs/CONTRACTS.md) (forma de requests/responses y errores)
2. [`docs/SECURITY.md`](docs/SECURITY.md) (JWT, guard, sesión Redis, CORS, throttling)
3. [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) y [`docs/OPERATIONS.md`](docs/OPERATIONS.md)
4. [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md)
5. [`docs/FEATURES/README.md`](docs/FEATURES/README.md) + `docs/FEATURES/*.md` (flujos por dominio)
6. [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) (naming, imports, estilo, testing)
7. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (capas y responsabilidades)
8. `README.md` raíz y `apps/*/README.md` (detalle operativo)

## Definición De Hecho (DoD)

Una tarea se considera completa cuando:
- Compila en TS sin romper strictness.
- Pasa lint en el scope modificado.
- Mantiene o agrega tests del comportamiento tocado.
- No rompe contratos documentados en [`docs/CONTRACTS.md`](docs/CONTRACTS.md).
- Si cambió arquitectura/contratos/seguridad/feature, la documentación correspondiente se actualizó en la misma PR.

## Estado De La Documentación

Documentación orientada a agentes IA:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): capas, estructura y ubicación de cambios.
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md): normas de código para backend NestJS.
- [`docs/CONTRACTS.md`](docs/CONTRACTS.md): contratos HTTP y envelope de respuestas.
- [`docs/SECURITY.md`](docs/SECURITY.md): decisiones de seguridad y sesión.
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md): matriz de variables de entorno y validación.
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md): runbook docker/local, puertos y health checks.
- [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md): correlación, logging y sanitización.
- [`docs/FEATURES/README.md`](docs/FEATURES/README.md): índice de features documentadas.
- [`docs/FEATURES/_template.md`](docs/FEATURES/_template.md): plantilla para nuevas features.
