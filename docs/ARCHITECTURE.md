# ARCHITECTURE

## Capas Principales

1. Presentación (`controllers`, `main.ts`, Swagger)
2. Aplicación (commands, queries, handlers, services, DTOs)
3. Dominio (entities, ports, enums, specifications)
4. Infraestructura (TypeORM repos, DB modules/config)
5. Infra transversal compartida (`libs/common`)

## Estructura Del Monorepo

- `apps/auth/`
  - API de autenticación: register/login/logout/refresh + `healthz`.
- `apps/links/`
  - API de links y group-links + `healthz`.
- `libs/common/src/`
  - Auth guard JWT, config/env, responses, filters, i18n, logging, redis cache/session, throttler, helpers.
- `test/`
  - utilidades compartidas de testing.

## Artefactos De Arquitectura Relacionados

- Bootstrap de apps:
  - `apps/auth/src/main.ts`
  - `apps/links/src/main.ts`
- Módulos raíz:
  - `apps/auth/src/auth.module.ts`
  - `apps/links/src/links.module.ts`
- Configuración transversal:
  - `libs/common/src/config/**`
  - `libs/common/src/filters/**`
  - `libs/common/src/guards/**`
  - `libs/common/src/responses/**`

## Flujo Recomendado De Cambios

1. Definir DTO request/response en `application/requests` y `application/responses`.
2. Modelar caso de uso con `Command/Query` + `Handler` (extender `BaseHandler` o `BasePaginatedHandler`).
3. Aplicar reglas de dominio (`entities`, `ports`, `specifications`) sin acoplar a TypeORM.
4. Implementar/ajustar repositorio en `infrastructure/repositories`.
5. Exponer endpoint en controller y documentar Swagger.
6. Cubrir con tests unitarios del handler/validador y actualizar docs afectadas.

## Flujo De Petición (Normativo)

1. `Controller` valida forma de entrada (DTO + `ValidationPipe`).
2. `Controller` delega a `CommandBus` o `QueryBus`.
3. `Handler` orquesta caso de uso y dependencias de dominio.
4. `Repository` resuelve persistencia vía puerto/adaptador.
5. `Handler` transforma a response DTO.
6. Se retorna `ApiResponse<T>` uniforme.

## Enrutamiento HTTP

- Auth service:
  - prefijo `auth` en `AuthController`
  - endpoint de salud `GET /healthz`
- Links service:
  - prefijos `links` y `group-links`
  - endpoint de salud `GET /healthz`

Cada microservicio expone Swagger en `/docs`.

## Dónde Va Cada Cambio

- Nuevo endpoint auth: `apps/auth/src/auth.controller.ts` + command/handler/service.
- Nuevo endpoint de links/group-links: controllers de `apps/links/src/*controller.ts` + CQRS.
- Cambios de envelope/error transversal: `libs/common/src/responses/**` y `libs/common/src/filters/**`.
- Cambios de seguridad JWT/sesión: `libs/common/src/guards/**` y `libs/common/src/redis/session/**`.
- Cambios de CORS/Helmet/throttle/env: `libs/common/src/config/**`, `libs/common/src/throttler/**`.
- Nueva regla de consulta reutilizable: `apps/*/src/domain/specifications/**`.
- Nueva entidad de dominio: `apps/*/src/domain/entities/**` + puerto/repositorio relacionado.

## Documentación Complementaria

- Contratos: [`CONTRACTS.md`](CONTRACTS.md)
- Seguridad: [`SECURITY.md`](SECURITY.md)
- Entorno: [`ENVIRONMENT.md`](ENVIRONMENT.md)
- Operación: [`OPERATIONS.md`](OPERATIONS.md)
- Observabilidad: [`OBSERVABILITY.md`](OBSERVABILITY.md)
- Convenciones: [`CONVENTIONS.md`](CONVENTIONS.md)
- Features: [`FEATURES/README.md`](FEATURES/README.md)
