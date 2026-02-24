# AUTH

## Objetivo

Gestionar identidad y sesión de usuario en la plataforma:
- registro de usuario
- login
- refresh de tokens
- logout con invalidación de sesión

## Alcance Y Límites

Incluye:
- `apps/auth/src/auth.controller.ts`
- commands/handlers/services de auth
- entidad `User` y puerto `IUserRepository`
- repositorio TypeORM de usuario

No incluye:
- endpoints de links/group-links
- validaciones y comportamiento interno de `JwtAuthGuard` fuera del flujo auth (documentado en `SECURITY.md`)

## Endpoints

- `POST /auth/register` (público)
- `POST /auth/login` (público)
- `POST /auth/logout` (requiere bearer access token)
- `POST /auth/refresh` (público, requiere refresh token válido)
- `GET /healthz` (público)

## Flujo De Datos

1. Controller recibe request DTO validado (`RegisterRequest`, `LoginRequest`, `RefreshRequest`).
2. Controller envía command al `CommandBus`.
3. Handler usa servicios (`AuthService`, `UserService`, `HashService`) y repositorio de usuario.
4. En login/register/refresh se generan nuevos tokens.
5. En logout se invalida sesión activa asociada al token.
6. Respuesta vuelve en envelope `ApiResponse<T>`.

## Ciclo De Sesión JWT

1. Login/Register crea payload con `jti` nuevo.
2. Se emiten `accessToken` y `refreshToken` con claims (`sub`, `email`, `jti`, `tokenType`).
3. Se guarda sesión en Redis usando `session:<userId>:<jti>`.
4. Refresh valida token tipo `REFRESH` y sesión activa de ese `jti`.
5. Refresh emite nuevos tokens con nuevo `jti` y crea nueva sesión.
6. Logout valida token tipo `ACCESS` y elimina solo la sesión del `jti` actual.

## Contratos Clave

Entrada:
- `AuthCredentialsRequest { email, password }`
- `RefreshRequest { refreshToken }`

Salida:
- `LoginResponse { accessToken, refreshToken }`
- `ApiResponse<null>` para logout

## Dependencias

- `libs/common/src/guards` (auth guard module)
- `libs/common/src/redis/session` (control de sesión)
- `libs/common/src/responses` (envelope)
- `libs/common/src/i18n` (mensajes)
- `libs/common/src/throttler` (rate limit)

## Known Decisions

- `register`, `login` y `refresh` tienen `@Throttle` propio además del throttler global.
- `logout` usa token access actual para invalidar sesión, no body DTO.
- `logout` devuelve `ApiResponse<null>` (sin payload booleano).
- `refresh` retorna par completo (`accessToken`, `refreshToken`) y no solo access token.
- `refresh` no revoca automáticamente sesiones previas; pueden coexistir múltiples sesiones activas por usuario.

## Reglas De Cambio Seguro

- No cambiar formato de `LoginResponse` sin actualizar consumidores y `CONTRACTS.md`.
- Si cambian claims JWT o semántica de refresh/logout, actualizar `SECURITY.md`.
- Si cambia estrategia de concurrencia de sesiones (single-session vs multi-session), documentarlo aquí.
- Mantener validación de credenciales con límites de longitud actuales salvo decisión explícita.
- Ejecutar mínimo `npm run test:auth` tras cambios en auth.
