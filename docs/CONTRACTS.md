# CONTRACTS

Define contratos HTTP actuales de la API y reglas para evolucionarlos sin romper consumidores.

## Fuente De Verdad

- DTOs request/response en `apps/auth/src/application/{requests,responses}` y `apps/links/src/application/{requests,responses}`.
- Documentación Swagger generada por decorators en controllers/DTOs.
- Envelope base en `libs/common/src/responses/**`.

## Envelope De Respuesta (Patrón Actual)

Éxito y error comparten estructura base:

- `success: boolean`
- `data: T | null`
- `messageList?: { message: string; type: 'info' | 'success' | 'warning' | 'error' | 'critical' }[]`
- `code?: string`

Regla:
- No retornar payloads fuera de este envelope desde handlers/controllers.

### Semántica De `code`

- `code` es opcional y pensado para clasificación estable de errores/avisos.
- Si se usa, debe representar un código de dominio o plataforma (no texto libre de UI).
- Si no hay un catálogo formal para el caso, omitir `code` y usar `messageList`.

## Contrato De Error Normalizado

- `ValidationExceptionFilter` y `GlobalExceptionFilter` devuelven:
  - `success: false`
  - `data: null`
  - `messageList` con `type: error`
- En validación, mensajes vienen traducidos por i18n cuando aplica.
- Los errores globales no deben filtrar internals; `GlobalExceptionFilter` responde mensaje genérico para errores 5xx.

## Endpoints Auth (apps/auth)

- `POST /auth/register`
  - request: `RegisterRequest { email, password }`
  - response: `ApiResponse<LoginResponse>`
- `POST /auth/login`
  - request: `LoginRequest { email, password }`
  - response: `ApiResponse<LoginResponse>`
- `POST /auth/logout`
  - auth: bearer access token
  - response: `ApiResponse<null>`
- `POST /auth/refresh`
  - request: `RefreshRequest { refreshToken }`
  - response: `ApiResponse<LoginResponse>`
- `GET /healthz`
  - response: `ApiResponse<{ serviceName, timestamp }>`

`LoginResponse` actual:
- `accessToken: string`
- `refreshToken: string`

### Semántica HTTP Auth

- `POST /auth/register`: `201` éxito, `400` formato inválido, `409` email duplicado, `500` error interno de token/sesión, `503` infraestructura de sesión.
- `POST /auth/login`: `200` éxito, `400` formato inválido, `401` credenciales inválidas, `500` error interno de token/sesión, `503` infraestructura de sesión.
- `POST /auth/logout`: `200` éxito, `401` token/sesión inválida o no activa, `503` infraestructura de sesión.
- `POST /auth/refresh`: `200` éxito, `401` refresh inválido/no autorizado, `500` error interno de token, `503` infraestructura de sesión.

## Endpoints Links (apps/links)

Todos requieren bearer token con `JwtAuthGuard`, excepto `GET /healthz`.

Links:
- `POST /links`
- `GET /links/:id`
- `POST /links/paginated`
- `PATCH /links/:id`
- `DELETE /links/:id`
- `POST /links/favorite`
- `POST /links/unfavorite`

Group links:
- `POST /group-links`
- `POST /group-links/paginated`
- `POST /group-links/favorite`
- `POST /group-links/unfavorite`
- `GET /group-links/:id`
- `PATCH /group-links/:id`
- `DELETE /group-links/:id`

Health:
- `GET /healthz`

### Semántica HTTP Links

- Links/group-links usan `400` para payload o ids inválidos.
- Links/group-links usan `404` para recurso no encontrado.
- Creación/actualización de links usan `409` para conflicto de URL duplicada.
- Actualización de group-links usa `409` cuando el nuevo parent introduce ciclo de jerarquía.
- Fallas de infraestructura de cache/sesión pueden responder `503`.

## DTOs Clave (Estado Actual)

Auth:
- `AuthCredentialsRequest` (`email`, `password`)
- `RegisterRequest`, `LoginRequest`, `RefreshRequest`
- `LoginResponse`

Links:
- `CreateLinkRequest`, `UpdateLinkRequest`
- `CreateGroupLinkRequest`, `UpdateGroupLinkRequest`
- `MarkLinksAsFavoriteRequest`, `UnmarkLinksAsFavoriteRequest`
- `MarkGroupLinksAsFavoriteRequest`, `UnmarkGroupLinksAsFavoriteRequest`
- `GetLinkByIdResponse`, `GetGroupLinkByIdResponse`
- `PaginatedRequest`, `PaginatedResponse<T>`
- `SuccessFailureResponse<number>`

## Reglas Para Nuevos Contratos

- Separar request/response por caso de uso; no reutilizar DTO ambiguo sin necesidad.
- Mantener validaciones con mensajes explícitos (idealmente i18n keys).
- Si hay operación batch parcial, usar `SuccessFailureResponse`.
- Si cambias campos o semántica:
  - actualizar decorators Swagger
  - actualizar tests de validators/handlers
  - actualizar este archivo y la feature correspondiente.

## Contratos Relacionados

- Seguridad y auth/session: [`SECURITY.md`](SECURITY.md)
- Entorno de ejecución: [`ENVIRONMENT.md`](ENVIRONMENT.md)
- Operación y puertos: [`OPERATIONS.md`](OPERATIONS.md)
