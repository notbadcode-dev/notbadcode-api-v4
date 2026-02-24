# LINKS

## Objetivo

Gestionar enlaces y agrupaciones de enlaces por usuario autenticado:
- CRUD de links
- CRUD de group-links
- listados paginados
- operaciones batch de favorito/unfavorito

## Alcance Y Límites

Incluye:
- `apps/links/src/links.controller.ts`
- `apps/links/src/group-links.controller.ts`
- commands/queries/handlers/services de links
- entidades `Link` y `GroupLink`
- puertos `ILinkRepository`, `IGroupLinkRepository`

No incluye:
- autenticación primaria (register/login)
- infraestructura global de seguridad fuera del guard JWT

## Endpoints

Links (auth requerido):
- `POST /links`
- `GET /links/:id`
- `POST /links/paginated`
- `PATCH /links/:id`
- `DELETE /links/:id`
- `POST /links/favorite`
- `POST /links/unfavorite`

Group links (auth requerido):
- `POST /group-links`
- `POST /group-links/paginated`
- `POST /group-links/favorite`
- `POST /group-links/unfavorite`
- `GET /group-links/:id`
- `PATCH /group-links/:id`
- `DELETE /group-links/:id`

Health:
- `GET /healthz` (público)

## Flujo De Datos

1. Controller protegido por `JwtAuthGuard` extrae `userId` con `@CurrentUserId()`.
2. Controller valida DTO y despacha a `CommandBus` o `QueryBus`.
3. Handler aplica reglas de dominio y usa puertos de repositorio.
4. Repositorio TypeORM persiste o consulta datos.
5. Handler retorna `ApiResponse<T>` o paginado en envelope estándar.

## Contratos Clave

Entrada:
- `CreateLinkRequest`, `UpdateLinkRequest`
- `CreateGroupLinkRequest`, `UpdateGroupLinkRequest`
- `PaginatedRequest`
- `Mark*/Unmark*AsFavoriteRequest`

Salida:
- `GetLinkByIdResponse`
- `GetGroupLinkByIdResponse`
- `ApiResponse<PaginatedResponse<T>>`
- `ApiResponse<SuccessFailureResponse<number>>` para operaciones batch

## Dependencias

- `libs/common/src/guards/jwt-auth.guard.ts`
- `libs/common/src/requests/paginated-request.ts`
- `libs/common/src/responses/**`
- `libs/common/src/database/**`
- `libs/common/src/i18n/**`

## Known Decisions

- Los listados son vía `POST .../paginated` con body `PaginatedRequest`.
- Operaciones batch de favorito no fallan todo-or-nada; devuelven `successList`/`failureList`.
- Las respuestas de detalle incluyen campos opcionales/nullables para soportar datos incompletos.
- En `group-links`, el cambio de `parentGroupLinkId` previene autorreferencia y ciclos de jerarquía (cadena de padres).
- Semántica HTTP actual de errores:
  - `400` para payload/ids inválidos.
  - `404` para recursos no encontrados.
  - `409` para conflictos (por ejemplo, duplicados de URL o parent inválido por ciclo).

## Reglas De Cambio Seguro

- No quitar `@UseGuards(JwtAuthGuard)` de controllers de links/group-links.
- Si cambian DTOs de paginación o favoritos, actualizar tests de validators/handlers y `CONTRACTS.md`.
- Mantener consistencia de not-found y unauthorized con constantes swagger/error actuales.
- Ejecutar mínimo `npm run test:links` tras cambios en la feature.
