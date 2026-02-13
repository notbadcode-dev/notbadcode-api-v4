# Documentacion de NotBadCode API v4

Bienvenido a la documentacion tecnica de **NotBadCode API v4**. Esta guia esta diseñada para desarrolladores y agentes de IA que necesiten crear o modificar componentes del sistema.

---

## Indice de Documentos

### Arquitectura y Componentes

| Documento | Descripcion | Nivel |
|-----------|-------------|-------|
| [Controller](./controller.md) | Guia para crear controladores REST | Principiante |
| [Handler](./handler.md) | Guia para crear Command y Query Handlers | Intermedio |
| [Repository](./repository.md) | Guia para crear repositorios (puertos y adaptadores) | Intermedio |
| [Entity](./entity.md) | Guia para crear entidades de dominio | Avanzado |
| [Imports](./imports.md) | Guia de imports y path aliases | Principiante |

---

## Vision General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION                               │
│                                                                         │
│    Controller ──► Recibe HTTP, delega a CQRS, retorna ApiResponse       │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION                                │
│                                                                         │
│    Command/Query ──► Inmutables, transportan datos                      │
│    Handler ──► Orquesta flujo, llama a dominio y repositorios           │
│    Request ──► DTO de entrada con validacion de forma                   │
│    Response ──► DTO de salida con transformacion                        │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                DOMAIN                                   │
│                                                                         │
│    Entity ──► Factory methods, metodos de dominio, invariantes          │
│    Port (Interface) ──► Contrato para repositorios                      │
│    Specification ──► Criterios de busqueda reutilizables                │
│    Enum ──► Estados y tipos del dominio                                 │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            INFRASTRUCTURE                               │
│                                                                         │
│    TypeOrmRepository ──► Implementacion de puertos con TypeORM          │
│    Database Config ──► Configuracion de conexion                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de una Peticion

### Ejemplo: POST /items (Crear Item)

```
1. HTTP Request
       │
       ▼
2. Controller.create()
   └── Recibe @Body() y @CurrentUserId()
       │
       ▼
3. CommandBus.execute(new CreateItemCommand(...))
       │
       ▼
4. CreateItemHandler.execute()
   ├── Valida precondiciones (duplicados, etc.)
   ├── Item.create() ← Factory method valida invariantes
   ├── repository.save(item)
   └── plainToInstance(Response, item)
       │
       ▼
5. ApiResponse<ItemResponse>
       │
       ▼
6. HTTP Response (JSON)
```

---

## Patrones Implementados

| Patron | Donde se aplica | Documento |
|--------|-----------------|-----------|
| **CQRS** | Commands/Queries separados | [Handler](./handler.md) |
| **Hexagonal** | Puertos y Adaptadores | [Repository](./repository.md) |
| **Repository** | Abstraccion de persistencia | [Repository](./repository.md) |
| **Factory Method** | Creacion de entidades | [Entity](./entity.md) |
| **Specification** | Criterios de busqueda | [Repository](./repository.md) |
| **Result Pattern** | Manejo de errores sin excepciones | [Handler](./handler.md) |

---

## Estructura de Directorios

```
apps/<microservicio>/
└── src/
    ├── <nombre>.controller.ts         # → controller.md
    ├── <nombre>-healthz.controller.ts
    ├── <nombre>.module.ts
    │
    ├── application/
    │   ├── commands/                  # → handler.md
    │   ├── queries/                   # → handler.md
    │   ├── handlers/                  # → handler.md
    │   ├── requests/                  # → controller.md
    │   └── responses/                 # → controller.md
    │
    ├── domain/
    │   ├── entities/                  # → entity.md
    │   ├── ports/                     # → repository.md
    │   ├── specifications/            # → repository.md
    │   └── enums/                     # → entity.md
    │
    ├── infrastructure/
    │   ├── repositories/              # → repository.md
    │   └── database/
    │
    └── constants/
        └── error-messages.constants.ts
```

---

## Guia Rapida: Crear un CRUD Completo

### Paso 1: Crear la Entidad

```bash
# Ubicacion
apps/<service>/src/domain/entities/<entity>.entity.ts
apps/<service>/src/domain/enums/<entity>-status.enum.ts
```

Seguir: [entity.md](./entity.md)

### Paso 2: Crear el Puerto (Interfaz)

```bash
# Ubicacion
apps/<service>/src/domain/ports/<entity>-repository.port.ts
```

Seguir: [repository.md](./repository.md)

### Paso 3: Crear el Adaptador (Implementacion)

```bash
# Ubicacion
apps/<service>/src/infrastructure/repositories/typeorm-<entity>.repository.ts
```

Seguir: [repository.md](./repository.md)

### Paso 4: Crear Commands, Queries y Handlers

```bash
# Ubicacion
apps/<service>/src/application/commands/
apps/<service>/src/application/queries/
apps/<service>/src/application/handlers/
```

Seguir: [handler.md](./handler.md)

### Paso 5: Crear Request y Response DTOs

```bash
# Ubicacion
apps/<service>/src/application/requests/
apps/<service>/src/application/responses/
```

Seguir: [controller.md](./controller.md)

### Paso 6: Crear el Controller

```bash
# Ubicacion
apps/<service>/src/<entity>.controller.ts
```

Seguir: [controller.md](./controller.md)

### Paso 7: Registrar en el Modulo

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    CqrsModule,
  ],
  controllers: [EntityController],
  providers: [
    // Handlers
    CreateEntityHandler,
    GetEntityByIdHandler,
    // Repositorio
    { provide: 'IEntityRepository', useClass: TypeOrmEntityRepository },
  ],
})
export class EntityModule {}
```

---

## Convenciones de Nomenclatura

### Archivos

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Controller | `<entity>.controller.ts` | `items.controller.ts` |
| Handler | `<action>-<entity>.handler.ts` | `create-item.handler.ts` |
| Command | `<action>-<entity>.command.ts` | `create-item.command.ts` |
| Query | `get-<entity>-<filter>.query.ts` | `get-item-by-id.query.ts` |
| Request | `<action>-<entity>.request.ts` | `create-item.request.ts` |
| Response | `<entity>.response.ts` | `item.response.ts` |
| Entity | `<entity>.entity.ts` | `item.entity.ts` |
| Port | `<entity>-repository.port.ts` | `item-repository.port.ts` |
| Repository | `typeorm-<entity>.repository.ts` | `typeorm-item.repository.ts` |

### Clases

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Controller | `<Entity>Controller` | `ItemsController` |
| Handler | `<Action><Entity>Handler` | `CreateItemHandler` |
| Command | `<Action><Entity>Command` | `CreateItemCommand` |
| Query | `Get<Entity><Filter>Query` | `GetItemByIdQuery` |
| Request | `<Action><Entity>Request` | `CreateItemRequest` |
| Response | `<Entity>Response` | `ItemResponse` |
| Entity | `<Entity>` | `Item` |
| Port | `I<Entity>Repository` | `IItemRepository` |
| Repository | `TypeOrm<Entity>Repository` | `TypeOrmItemRepository` |

---

## Librerias Compartidas

### @common

Codigo reutilizable entre microservicios:

| Modulo | Descripcion |
|--------|-------------|
| `@common/database` | Entidades base, column types |
| `@common/handler` | BaseHandler, BasePaginatedHandler |
| `@common/responses` | ApiResponse, PaginatedResponse |
| `@common/requests` | PaginatedRequest |
| `@common/decorators` | CurrentUserId, CurrentAccessToken |
| `@common/guards` | JwtAuthGuard |
| `@common/i18n` | I18nService, traducciones |
| `@common/helpers` | PaginateHelper, utilidades |
| `@common/constants` | LengthSizes, constantes |

---

## Testing

### Estructura

```
apps/<service>/test/
├── unit/
│   └── handlers/
│       └── <handler-name>/
│           ├── <handler>.spec.ts
│           └── <handler>.fixture.ts
└── utils/
    └── mock-factories.ts
```

### Convenciones

- Mock de repositorios con `jest-mock-extended`
- Fixtures para datos de prueba
- Cobertura minima: 80%

---

## Recursos Externos

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [CQRS Pattern](https://docs.nestjs.com/recipes/cqrs)

---

## Historial de Cambios

| Fecha | Version | Cambios |
|-------|---------|---------|
| 2026-02-08 | 1.0.0 | Documentacion inicial |

---

<p align="center">
  <sub>Documentacion para NotBadCode API v4</sub>
</p>
