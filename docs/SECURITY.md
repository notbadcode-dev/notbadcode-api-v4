# SECURITY

Decisiones de seguridad implementadas actualmente en el backend.

## Estado Actual (Implementado)

## Autenticación JWT

- Estrategia bearer token en headers `Authorization: Bearer <token>`.
- `JwtAuthGuard` valida:
  - formato bearer
  - firma/expiración JWT
  - `tokenType` igual a `ACCESS`
  - existencia de sesión en Redis (`userId + sessionId`)
- Endpoints de `links` y `group-links` están protegidos por `@UseGuards(JwtAuthGuard)`.

### Claims Relevantes

- `sub`: user id
- `email`: identidad de usuario
- `jti`: session id
- `tokenType`: `access` | `refresh`

## Sesión Distribuida (Redis)

- `CommonSessionControlService` guarda y consulta sesión por key:
  - `session:<userId>:<sessionId>`
- Si la sesión no existe, el guard rechaza con `Unauthorized`.
- Logout invalida sesión eliminando la entrada correspondiente.
- En fallas de infraestructura de sesión/cache (Redis no disponible o datos corruptos), la API responde fail-closed con `503 Service Unavailable`.

### Ciclo De Vida De Sesión (Implementado)

- Login/Register:
  - generan `jti` nuevo y persisten sesión `session:<userId>:<jti>`.
- Refresh:
  - valida refresh token y sesión activa del `jti` actual.
  - genera nuevos tokens con `jti` nuevo y persiste nueva sesión.
  - no elimina automáticamente la sesión anterior (conviven hasta TTL/logout).
- Logout:
  - valida access token `tokenType=ACCESS`.
  - elimina sesión asociada al `jti` del token actual.

## Validación De Entrada

- `ValidationPipe` global con:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- `ValidationExceptionFilter` mapea errores de validación al envelope estándar.

## Hardening HTTP

- `helmet` activo en ambas apps:
  - configuración más estricta en producción
  - configuración relajada en desarrollo para Swagger UI
- Middleware de `Permissions-Policy` aplicado globalmente.
- Límite de body request: `100kb`.
- CORS configurado desde `CORS_ORIGINS` (lista CSV), con `credentials: true`.

### Headers/Políticas Aplicadas

- `Permissions-Policy` explícita con deshabilitación de APIs de browser no usadas.
- CORS:
  - métodos: `GET, POST, PATCH, DELETE, OPTIONS`
  - headers permitidos: `Content-Type`, `Authorization`, `Accept-Language`
  - `credentials: true`
- Helmet:
  - producción: CSP restrictiva (`defaultSrc 'none'`, etc.)
  - desarrollo: CSP relajada para Swagger UI

## Throttling

- `ThrottlerGuard` global vía `CommonThrottlerModule`.
- Configurable con:
  - `THROTTLE_TTL`
  - `THROTTLE_LIMIT`
- `auth/register` y `auth/login` agregan límites específicos adicionales con `@Throttle`.
- `auth/refresh` también agrega límites específicos con `@Throttle`.

## Transporte (HTTP/HTTPS)

- En desarrollo se levanta HTTP por defecto.
- En producción se habilita HTTPS leyendo:
  - `SSL_KEY_PATH`
  - `SSL_CERT_PATH`

## Riesgos/Tradeoffs Conocidos

- Si se elimina chequeo de sesión Redis en `JwtAuthGuard`, logout deja de invalidar accesos activos.
- CORS mal configurado (`*` o lista abierta) expone endpoints a orígenes no confiables.
- Cambios en filtros globales pueden romper homogeneidad de errores para clientes.
- Rotación de refresh sin invalidación de sesión previa permite sesiones simultáneas válidas durante su TTL.

## Reglas De Cambio Seguro

- No modificar `JwtAuthGuard` sin revisar impacto en `auth/logout` y rotación de tokens.
- No eliminar `ValidationPipe` global ni `forbidNonWhitelisted` sin aprobación explícita.
- Cualquier cambio de JWT (claims, expiración, tipo de token) debe reflejarse en:
  - handlers de auth
  - guard
  - esta documentación en la misma PR.
- Si cambia política CORS/Helmet/Throttle, actualizar este archivo y pruebas asociadas.
- Si cambia semántica de refresh/logout o claims JWT, actualizar también `docs/FEATURES/auth.md`.

## Documentos Relacionados

- Contratos HTTP: [`CONTRACTS.md`](CONTRACTS.md)
- Entorno: [`ENVIRONMENT.md`](ENVIRONMENT.md)
- Operación: [`OPERATIONS.md`](OPERATIONS.md)
- Observabilidad: [`OBSERVABILITY.md`](OBSERVABILITY.md)
