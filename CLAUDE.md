# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Build
npm run build                    # Build all
npm run build:auth               # Build auth service
npm run build:links              # Build links service

# Dev (hot-reload)
npm run start:auth:dev           # Auth on port 60200
npm run start:links:dev          # Links on port 60201

# Infrastructure (MariaDB, Redis)
npm run docker:up:prod           # Start containers
npm run docker:down              # Stop containers

# Test
npm test                         # All tests
npm run test:auth                # Auth tests only
npm run test:links               # Links tests only
npm run test:common              # Common lib tests only
npm run test:cov                 # Coverage

# Quality
npm run lint                     # ESLint check
npm run lint:fix                 # ESLint auto-fix
npm run format                   # Prettier format
```

## Architecture

NestJS monorepo with CQRS, hexagonal architecture, and DDD patterns.

**Apps:**
- `apps/auth/` — Authentication (JWT, Passport, bcrypt, CSRF)
- `apps/links/` — Links management (CRUD, favorites, groups)

**Shared library:** `libs/common/` — Guards, decorators, filters, interceptors, i18n, config, base entities, response builders.

**Path aliases:** `@common/*` → `libs/common/src/*`, `@apps/auth/*` → `apps/auth/*`, `@apps/links/*` → `apps/links/*`, `@test/*` → `test/*`.

### App Layer Structure

```
src/
├── application/
│   ├── commands/        # Write DTOs (e.g. LoginCommand)
│   ├── queries/         # Read DTOs (links app)
│   ├── handlers/        # Command/Query handlers extending BaseHandler
│   ├── requests/        # Request DTOs (class-validator)
│   ├── responses/       # Response DTOs
│   └── services/        # Application services
├── domain/
│   ├── entities/        # TypeORM entities extending AuditableEntity/DeletableEntity
│   ├── ports/           # Repository interfaces
│   └── specifications/  # Domain specifications
└── infrastructure/
    ├── database/        # TypeORM config
    └── repositories/    # Repository implementations
```

### Key Patterns

**Handlers:** Extend `BaseHandler<TCommand, TResult>`, inject `I18nService`, use `createResponseFailure()`/`createSuccessResponse()`.

**Responses:** `ApiResponse<T>` = `ApiSuccessResponse<T> | ApiFailureResponse`. All messages translated via i18n. Use `apiResponseSuccess()`/`apiResponseFailure()`. For Swagger: `createApiResponse(ResponseClass)`.

**Error handling:** Result pattern with `ErrorOn<T>` — no throwing exceptions from handlers.

**Repositories:** Interfaces in `domain/ports/`, injected via string tokens (`@Inject('IUserRepository')`), implementations in `infrastructure/repositories/`.

**Controllers:** Use `CommandBus.execute()` for writes, `QueryBus.execute()` for reads. Custom decorators: `@CurrentUserId()`, `@CurrentAccessToken()`.

## Database

TypeORM 0.3 with MariaDB. Base entities: `AuditableEntity` (id, createdAt, updatedAt), `DeletableEntity` (+ soft delete). Env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

## Testing

Jest with `ts-jest`. Test mocks in `test/utils/mocks/` (i18n, config, cache, winston, responses). Factories in `test/utils/factories/`. Coverage excludes constants, enums, types, entities, config files.

## ESLint Rules (strict)

- `@typescript-eslint/explicit-function-return-type`: **error** — all functions must have return types
- `@typescript-eslint/consistent-type-imports`: use `import { type X }` inline style
- `@typescript-eslint/no-magic-numbers`: warn (ignore 0, 1, -1, enums, readonly props)
- `sonarjs/no-duplicate-string`: extract repeated strings into constants
- Import order enforced: builtins → external → internal (@common, @apps) → relative → types
- No `console.log` (only warn/error/info)
- Test files: relaxed rules (no explicit-any, no return type requirement)

## i18n

Translation files in `libs/common/src/i18n/{en,es}/`. Keys organized per domain (auth.json, links.json, common.json). Use `I18nService.translate(key)`.

## Configuration

NestJS ConfigModule with Joi validation. Env vars from `.env` (see `.env.example`). SSL certs in `certs/`. Security: Helmet, CORS, CSRF tokens in Redis sessions.

## Swagger Constants

Shared API descriptions live in `libs/common/src/constants/swagger.constants.ts` (`SwaggerConstants.descriptions`). App-specific descriptions in `apps/*/src/constants/swagger.constants.ts`.

## Conventions

- Entities: PascalCase. Files: kebab-case with suffix (`.service.ts`, `.handler.ts`, `.command.ts`).
- Constants objects (not enums) for config values. Error message constants per domain.
- Barrel exports (`index.ts`) in every directory.
- Node.js 22+ required (ESLint uses `structuredClone`).
