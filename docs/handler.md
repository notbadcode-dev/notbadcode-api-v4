# Guia para crear Handlers

Esta guia explica como crear Command Handlers y Query Handlers en **NotBadCode API v4** siguiendo el patron CQRS y las convenciones del proyecto.

---

## Indice

- [Principios Fundamentales](#principios-fundamentales)
- [Tipos de Handlers](#tipos-de-handlers)
- [BaseHandler](#basehandler)
- [Command Handlers](#command-handlers)
- [Query Handlers](#query-handlers)
- [BasePaginatedHandler](#basepaginatedhandler)
- [Manejo de Errores](#manejo-de-errores)
- [Inyeccion de Dependencias](#inyeccion-de-dependencias)
- [Testing](#testing)
- [Ejemplo Completo](#ejemplo-completo)
- [Checklist](#checklist)

---

## Principios Fundamentales

### Responsabilidades del Handler

Los handlers son la **capa de orquestacion**. Su unica responsabilidad es coordinar el flujo de la operacion.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RESPONSABILIDADES                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ✅ Orquestar el flujo de la operacion                                  │
│  ✅ Llamar a repositorios para persistencia                             │
│  ✅ Llamar a factory methods de entidades                               │
│  ✅ Transformar entidades a DTOs de respuesta                           │
│  ✅ Retornar ApiResponse (exito o error)                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ❌ NO validar datos que ya valida el DTO (class-validator)             │
│  ❌ NO implementar logica de negocio (va en entidades/servicios)        │
│  ❌ NO lanzar excepciones para errores controlados                      │
│  ❌ NO acceder directamente a la base de datos (usar repositorios)      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Oro

| Regla | Descripcion |
|-------|-------------|
| **Sin excepciones** | Nunca lanzar excepciones para errores de negocio |
| **Siempre ApiResponse** | Retornar `ApiResponse<T>` en todos los casos |
| **Mensajes i18n** | Todos los mensajes de error son claves de internacionalizacion |
| **Inmutabilidad** | No mutar el Command/Query recibido |
| **Single Responsibility** | Un handler = una operacion |

---

## Tipos de Handlers

### Command Handlers

Para operaciones de **escritura** que modifican estado:

| Operacion | Metodo HTTP | Uso |
|-----------|-------------|-----|
| Crear | `POST` | `CreateItemHandler` |
| Actualizar | `PATCH` / `PUT` | `UpdateItemHandler` |
| Eliminar | `DELETE` | `DeleteItemHandler` |
| Acciones | `POST` | `MarkAsFavoriteHandler` |

### Query Handlers

Para operaciones de **lectura** que no modifican estado:

| Operacion | Metodo HTTP | Uso |
|-----------|-------------|-----|
| Obtener uno | `GET /:id` | `GetItemByIdHandler` |
| Listar | `GET` / `POST` | `GetItemsHandler` |
| Buscar | `POST` | `SearchItemsHandler` |
| Paginado | `POST /paginated` | `GetItemsPaginatedHandler` |

---

## BaseHandler

Todos los handlers deben extender `BaseHandler`.

### Ubicacion

```
libs/common/src/handler/base.handler.ts
```

### Definicion

```typescript
export abstract class BaseHandler<TCommand, TResult> {
  constructor(protected readonly i18nService: I18nService) {}

  abstract execute(command: TCommand): Promise<TResult>;

  protected async createResponseFailure(message: string): Promise<ApiFailureResponse>;
  protected async createSuccessResponse<T>(data: T): Promise<ApiSuccessResponse<T>>;
}
```

### Metodos Disponibles

| Metodo | Uso | Retorno |
|--------|-----|---------|
| `createSuccessResponse(data)` | Operacion exitosa | `ApiSuccessResponse<T>` |
| `createResponseFailure(messageKey)` | Error controlado | `ApiFailureResponse` |

### Ejemplo Basico

```typescript
@CommandHandler(CreateItemCommand)
export class CreateItemHandler
  extends BaseHandler<CreateItemCommand, ApiResponse<ItemResponse>>
  implements ICommandHandler<CreateItemCommand, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);  // ← Requerido
  }

  async execute(command: CreateItemCommand): Promise<ApiResponse<ItemResponse>> {
    // Implementacion...
  }
}
```

---

## Command Handlers

### Estructura Completa

```typescript
// application/handlers/create-item.handler.ts
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { CreateItemCommand } from '../commands/create-item.command';
import { ItemResponse } from '../responses/item.response';
import { Item } from '../../domain/entities/item.entity';
import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { ItemErrorMessageConstants } from '../../constants/item-error-message.constants';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler
  extends BaseHandler<CreateItemCommand, ApiResponse<ItemResponse>>
  implements ICommandHandler<CreateItemCommand, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: CreateItemCommand): Promise<ApiResponse<ItemResponse>> {
    // 1. Validaciones que requieren BD (duplicados, existencia, etc.)
    const existing = await this.itemRepository.findByName(
      command.userId,
      command.payload.name
    );

    if (existing) {
      return this.createResponseFailure(ItemErrorMessageConstants.duplicateName);
    }

    // 2. Crear entidad con factory method
    const item = Item.create({
      userId: command.userId,
      name: command.payload.name,
      description: command.payload.description,
    });

    // 3. Persistir
    const saved = await this.itemRepository.save(item);

    // 4. Transformar a response
    const response = plainToInstance(ItemResponse, {
      ...saved,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    }, { excludeExtraneousValues: true });

    // 5. Retornar exito
    return this.createSuccessResponse(response);
  }
}
```

### Flujo de un Command Handler

```
Command → Handler
            │
            ├─1─► Validar precondiciones (BD)
            │         └── Si falla → createResponseFailure()
            │
            ├─2─► Crear/modificar entidad (factory method)
            │         └── Si falla → DomainException (capturada globalmente)
            │
            ├─3─► Persistir (repositorio)
            │
            ├─4─► Transformar a DTO (plainToInstance)
            │
            └─5─► Retornar exito → createSuccessResponse()
```

### Handler de Update

```typescript
@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler
  extends BaseHandler<UpdateItemCommand, ApiResponse<ItemResponse>>
  implements ICommandHandler<UpdateItemCommand, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: UpdateItemCommand): Promise<ApiResponse<ItemResponse>> {
    // 1. Buscar entidad existente
    const item = await this.itemRepository.findOne({
      where: { id: command.id, userId: command.userId }
    });

    if (!item) {
      return this.createResponseFailure(ItemErrorMessageConstants.notFound);
    }

    // 2. Aplicar cambios usando metodos de dominio
    if (command.payload.name !== undefined) {
      item.updateName(command.payload.name);
    }

    if (command.payload.description !== undefined) {
      item.updateDescription(command.payload.description);
    }

    // 3. Persistir
    const saved = await this.itemRepository.save(item);

    // 4. Transformar y retornar
    const response = plainToInstance(ItemResponse, {
      ...saved,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    }, { excludeExtraneousValues: true });

    return this.createSuccessResponse(response);
  }
}
```

### Handler de Delete (Soft Delete)

```typescript
@CommandHandler(DeleteItemCommand)
export class DeleteItemHandler
  extends BaseHandler<DeleteItemCommand, ApiResponse<ItemResponse>>
  implements ICommandHandler<DeleteItemCommand, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: DeleteItemCommand): Promise<ApiResponse<ItemResponse>> {
    // 1. Verificar existencia
    const item = await this.itemRepository.findOne({
      where: { id: command.id, userId: command.userId }
    });

    if (!item) {
      return this.createResponseFailure(ItemErrorMessageConstants.notFound);
    }

    // 2. Soft delete
    await this.itemRepository.softDelete({ id: command.id, userId: command.userId });

    // 3. Retornar el item eliminado
    const response = plainToInstance(ItemResponse, {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }, { excludeExtraneousValues: true });

    return this.createSuccessResponse(response);
  }
}
```

---

## Query Handlers

### Estructura Completa

```typescript
// application/handlers/get-item-by-id.handler.ts
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { GetItemByIdQuery } from '../queries/get-item-by-id.query';
import { ItemResponse } from '../responses/item.response';
import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { ItemErrorMessageConstants } from '../../constants/item-error-message.constants';

@QueryHandler(GetItemByIdQuery)
export class GetItemByIdHandler
  extends BaseHandler<GetItemByIdQuery, ApiResponse<ItemResponse>>
  implements IQueryHandler<GetItemByIdQuery, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(query: GetItemByIdQuery): Promise<ApiResponse<ItemResponse>> {
    // 1. Buscar entidad
    const item = await this.itemRepository.findOne({
      where: { id: query.id, userId: query.userId }
    });

    // 2. Verificar existencia
    if (!item) {
      return this.createResponseFailure(ItemErrorMessageConstants.notFound);
    }

    // 3. Transformar a response
    const response = plainToInstance(ItemResponse, {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }, { excludeExtraneousValues: true });

    // 4. Retornar exito
    return this.createSuccessResponse(response);
  }
}
```

---

## BasePaginatedHandler

Para queries paginadas, usar `BasePaginatedHandler` que encapsula la logica comun.

### Ubicacion

```
libs/common/src/handler/base-paginates.handler.ts
```

### Definicion

```typescript
export abstract class BasePaginatedHandler<TCommand, TEntity, TResponseDto>
  extends BaseHandler<TCommand, ApiResponse<PaginatedResponse<TResponseDto>>>
{
  protected async executePaginated(
    repository: IPaginatableRepository<TEntity>,
    request: PaginatedRequest,
    map: (entity: TEntity) => TResponseDto,
    notFoundMessage: string,
    where?: FindOptionsWhere<TEntity>,
    relations?: string[],
  ): Promise<ApiResponse<PaginatedResponse<TResponseDto>>>;
}
```

### Ejemplo de Uso

```typescript
// application/handlers/get-items-paginated.handler.ts
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { type FindOptionsWhere } from 'typeorm';

import { BasePaginatedHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse, PaginatedResponse } from '@common/responses';

import { GetItemsPaginatedQuery } from '../queries/get-items-paginated.query';
import { ItemResponse } from '../responses/item.response';
import { Item } from '../../domain/entities/item.entity';
import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { ItemErrorMessageConstants } from '../../constants/item-error-message.constants';

@QueryHandler(GetItemsPaginatedQuery)
export class GetItemsPaginatedHandler
  extends BasePaginatedHandler<GetItemsPaginatedQuery, Item, ItemResponse>
  implements IQueryHandler<GetItemsPaginatedQuery, ApiResponse<PaginatedResponse<ItemResponse>>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(query: GetItemsPaginatedQuery): Promise<ApiResponse<PaginatedResponse<ItemResponse>>> {
    // 1. Definir funcion de mapeo
    const map = (item: Item): ItemResponse =>
      plainToInstance(ItemResponse, {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }, { excludeExtraneousValues: true });

    // 2. Definir filtro where
    const where = { userId: query.userId } as FindOptionsWhere<Item>;

    // 3. Ejecutar paginacion (el metodo base hace todo el trabajo)
    return this.executePaginated(
      this.itemRepository,
      query.request,
      map,
      ItemErrorMessageConstants.notFound,
      where,
      ['relatedEntity']  // Relaciones opcionales
    );
  }
}
```

### Parametros de executePaginated

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `repository` | `IPaginatableRepository<T>` | Repositorio con `findAndCount` |
| `request` | `PaginatedRequest` | Parametros de paginacion del cliente |
| `map` | `(entity) => DTO` | Funcion para transformar entidad a DTO |
| `notFoundMessage` | `string` | Clave i18n si no hay resultados |
| `where` | `FindOptionsWhere<T>` | Filtros opcionales |
| `relations` | `string[]` | Relaciones a cargar |

---

## Manejo de Errores

### Errores Controlados (Negocio)

Usar `createResponseFailure` con claves i18n:

```typescript
// ✅ CORRECTO
if (!item) {
  return this.createResponseFailure(ItemErrorMessageConstants.notFound);
}

if (existing) {
  return this.createResponseFailure(ItemErrorMessageConstants.duplicateName);
}
```

### Errores No Controlados (Sistema)

Dejar que se propaguen al filtro global de excepciones:

```typescript
// Las excepciones de BD, red, etc. se propagan automaticamente
const saved = await this.itemRepository.save(item);
// Si falla, el GlobalExceptionFilter lo maneja
```

### Constantes de Mensajes de Error

```typescript
// constants/item-error-message.constants.ts
export const ItemErrorMessageConstants = {
  notFound: 'item.error.notFound',
  duplicateName: 'item.error.duplicateName',
  invalidId: 'item.error.invalidId',
  unauthorized: 'item.error.unauthorized',
} as const;
```

### Archivos i18n Correspondientes

```json
// libs/common/src/i18n/en/item.json
{
  "error": {
    "notFound": "Item not found",
    "duplicateName": "An item with this name already exists",
    "invalidId": "Invalid item ID",
    "unauthorized": "You don't have permission to access this item"
  }
}

// libs/common/src/i18n/es/item.json
{
  "error": {
    "notFound": "Item no encontrado",
    "duplicateName": "Ya existe un item con este nombre",
    "invalidId": "ID de item invalido",
    "unauthorized": "No tienes permiso para acceder a este item"
  }
}
```

---

## Inyeccion de Dependencias

### Repositorios (Puertos)

Inyectar usando el token de la interfaz:

```typescript
constructor(
  @Inject('IItemRepository')
  private readonly itemRepository: IItemRepository,
  i18nService: I18nService,
) {
  super(i18nService);
}
```

### Servicios de Dominio

```typescript
constructor(
  @Inject('IItemRepository')
  private readonly itemRepository: IItemRepository,
  private readonly pricingService: PricingService,
  i18nService: I18nService,
) {
  super(i18nService);
}
```

### I18nService

**Siempre requerido** - se pasa al constructor de `BaseHandler`:

```typescript
constructor(
  i18nService: I18nService,  // ← Ultimo parametro por convencion
) {
  super(i18nService);
}
```

---

## Testing

### Estructura de Tests

```
apps/<microservicio>/test/unit/handlers/
├── create-item-handler/
│   ├── create-item.handler.spec.ts
│   └── create-item.handler.fixture.ts
├── update-item-handler/
│   ├── update-item.handler.spec.ts
│   └── update-item.handler.fixture.ts
└── get-item-by-id-handler/
    ├── get-item-by-id.handler.spec.ts
    └── get-item-by-id.handler.fixture.ts
```

### Ejemplo de Test

```typescript
// create-item.handler.spec.ts
import { mock, type MockProxy } from 'jest-mock-extended';

import { I18nService } from '@common/i18n';

import { CreateItemCommand } from '../../application/commands/create-item.command';
import { CreateItemHandler } from '../../application/handlers/create-item.handler';
import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { createMockItem, createMockCreateItemRequest } from './create-item.handler.fixture';

describe('CreateItemHandler', () => {
  let handler: CreateItemHandler;
  let itemRepository: MockProxy<IItemRepository>;
  let i18nService: MockProxy<I18nService>;

  beforeEach(() => {
    itemRepository = mock<IItemRepository>();
    i18nService = mock<I18nService>();

    i18nService.translate.mockImplementation(async (key: string) => key);

    handler = new CreateItemHandler(itemRepository, i18nService);
  });

  describe('execute', () => {
    it('should create item successfully', async () => {
      // Arrange
      const request = createMockCreateItemRequest();
      const command = new CreateItemCommand(request, 1);
      const savedItem = createMockItem({ ...request, id: 1, userId: 1 });

      itemRepository.findByName.mockResolvedValue(null);
      itemRepository.save.mockResolvedValue(savedItem);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(itemRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return error when item already exists', async () => {
      // Arrange
      const request = createMockCreateItemRequest();
      const command = new CreateItemCommand(request, 1);
      const existingItem = createMockItem({ id: 1 });

      itemRepository.findByName.mockResolvedValue(existingItem);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.success).toBe(false);
      expect(itemRepository.save).not.toHaveBeenCalled();
    });
  });
});
```

### Fixture de Test

```typescript
// create-item.handler.fixture.ts
import { Item } from '../../domain/entities/item.entity';
import { CreateItemRequest } from '../../application/requests/create-item.request';

export const createMockCreateItemRequest = (
  overrides?: Partial<CreateItemRequest>
): CreateItemRequest => ({
  name: 'Test Item',
  description: 'Test description',
  ...overrides,
});

export const createMockItem = (overrides?: Partial<Item>): Item => {
  const item = new Item();
  item.id = 1;
  item.userId = 1;
  item.name = 'Test Item';
  item.description = 'Test description';
  item.createdAt = new Date();
  item.updatedAt = new Date();
  Object.assign(item, overrides);
  return item;
};
```

---

## Ejemplo Completo

### Command

```typescript
// application/commands/create-item.command.ts
import { type CreateItemRequest } from '../requests/create-item.request';

export class CreateItemCommand {
  constructor(
    public readonly payload: Readonly<CreateItemRequest>,
    public readonly userId: number,
  ) {}
}
```

### Query

```typescript
// application/queries/get-item-by-id.query.ts
export class GetItemByIdQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
```

### Command Handler Completo

```typescript
// application/handlers/create-item.handler.ts
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

import { CreateItemCommand } from '../commands/create-item.command';
import { ItemResponse } from '../responses/item.response';
import { Item } from '../../domain/entities/item.entity';
import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { ItemErrorMessageConstants } from '../../constants/item-error-message.constants';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler
  extends BaseHandler<CreateItemCommand, ApiResponse<ItemResponse>>
  implements ICommandHandler<CreateItemCommand, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,
  ) {
    super(i18nService);
  }

  async execute(command: CreateItemCommand): Promise<ApiResponse<ItemResponse>> {
    // Verificar duplicados
    const existing = await this.itemRepository.findByName(
      command.userId,
      command.payload.name
    );

    if (existing) {
      return this.createResponseFailure(ItemErrorMessageConstants.duplicateName);
    }

    // Crear entidad
    const item = Item.create({
      userId: command.userId,
      name: command.payload.name,
      description: command.payload.description,
    });

    // Persistir
    const saved = await this.itemRepository.save(item);

    // Transformar
    const response = plainToInstance(ItemResponse, {
      ...saved,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    }, { excludeExtraneousValues: true });

    return this.createSuccessResponse(response);
  }
}
```

---

## Checklist

Antes de finalizar un handler, verifica:

### Decoradores

- [ ] `@CommandHandler(Command)` o `@QueryHandler(Query)`
- [ ] Implementa `ICommandHandler` o `IQueryHandler`
- [ ] Extiende `BaseHandler` o `BasePaginatedHandler`

### Constructor

- [ ] Repositorios inyectados con `@Inject('IRepository')`
- [ ] `I18nService` pasado a `super()`
- [ ] Dependencias tipadas con interfaces (no clases)

### Metodo execute

- [ ] Firma correcta: `async execute(command): Promise<ApiResponse<T>>`
- [ ] **No lanza excepciones** para errores de negocio
- [ ] Usa `createResponseFailure()` para errores
- [ ] Usa `createSuccessResponse()` para exito
- [ ] Mensajes de error son claves i18n

### Transformacion

- [ ] Usa `plainToInstance()` con `excludeExtraneousValues: true`
- [ ] Fechas convertidas a ISO string
- [ ] Response DTO correcto

### Registro

- [ ] Handler registrado en `providers` del modulo

---

## Recursos Adicionales

- [CQRS en NestJS](https://docs.nestjs.com/recipes/cqrs)
- [class-transformer](https://github.com/typestack/class-transformer)
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
