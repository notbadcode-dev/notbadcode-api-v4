# CONVENTIONS

Convenciones para cambios seguros en este backend NestJS.

## Naming

- Clases: `PascalCase`.
- Interfaces: prefijo `I` cuando represente contrato de dominio/app.
- Types: prefijo `T` cuando aplique.
- Enums: prefijo `E` y archivo `*.enum.ts`.
- Constantes: `*.constants.ts`.
- Requests/Responses: sufijos `*Request` y `*Response`.
- CQRS: `*.command.ts`, `*.query.ts`, `*.handler.ts`.

## Imports

- Ordenar imports por grupos (separados por línea en blanco):
  - `builtin`
  - `external`
  - `internal` (`@common/*`, `@apps/*`, `@test/*`)
  - `parent/sibling/index`
  - `type`
- Usar aliases `@...` por defecto. Evitar `../` salvo casos puntuales de carpeta hermana inmediata.
- Preferir aliases de `tsconfig.base.json`:
  - `@apps/auth/*`
  - `@apps/links/*`
  - `@common/*`
  - `@test/*`
- Si existe `index.ts` en la carpeta, importar desde el barrel y no desde archivo individual.
- Consolidar imports del mismo módulo en una sola línea.

## Estilo De Código

- Mantener TypeScript `strict` sin `any` innecesario.
- Tipos de retorno explícitos en APIs públicas y handlers cuando aporte claridad.
- Evitar lógica de negocio en controllers: delegar a bus CQRS/servicios.
- Validar input con `class-validator` + `ValidationPipe` global.
- Mantener DTOs pequeños, explícitos y orientados al endpoint.

## NestJS / API

- Controladores: delgados, sin acceso directo a repositorios.
- Aplicar decoradores Swagger en endpoints y DTOs públicos.
- Reusar `ApiResponse`, `createApiResponse`, `createPaginatedResponse` para documentar envelope.
- Para endpoints protegidos: `@ApiBearerAuth()` + `@UseGuards(JwtAuthGuard)`.
- Para paginación, mantener convención actual de endpoint `POST .../paginated` con `PaginatedRequest`.

## Arquitectura (Hexagonal + CQRS)

- El dominio define puertos (`domain/ports`) y no depende de TypeORM.
- Infraestructura implementa puertos con repositorios concretos.
- Comandos: escritura. Queries: lectura.
- Handlers no deben mezclar concerns de transporte HTTP.
- Handlers deben extender:
  - `BaseHandler` para respuestas simples.
  - `BasePaginatedHandler` para listados paginados.
- En mapeo a DTO de salida, preferir `plainToInstance(..., { excludeExtraneousValues: true })`.
- Mantener `ErrorOn<T>` para resultados de servicios que evitan excepciones de negocio.

## Dominio / Repositorios

- Entidades deben exponer factory methods (`Entity.create`) para centralizar invariantes.
- Puertos de repositorio se definen en `domain/ports`; adaptadores TypeORM en `infrastructure/repositories`.
- Reutilizar specifications (`domain/specifications`) para criterios de consulta reutilizables.
- Registrar puertos/adaptadores en el módulo con token explícito (ej. `provide: 'ILinkRepository'`).

## Testing

- Mantener tests unitarios en:
  - `apps/auth/test/unit/**`
  - `apps/links/test/unit/**`
  - `libs/common/test/unit/**`
- Ejecutar al menos tests del scope tocado (`test:auth`, `test:links`, `test:common`).
- Si cambias validaciones, agrega/ajusta specs de validators.
- Actualmente la estrategia principal es unit testing (no hay suite e2e HTTP consolidada en scripts).

## Referencias

- Arquitectura: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Contratos: [`CONTRACTS.md`](CONTRACTS.md)
- Seguridad: [`SECURITY.md`](SECURITY.md)
- Entorno: [`ENVIRONMENT.md`](ENVIRONMENT.md)
- Operación: [`OPERATIONS.md`](OPERATIONS.md)
- Observabilidad: [`OBSERVABILITY.md`](OBSERVABILITY.md)
- Features: [`FEATURES/README.md`](FEATURES/README.md)
