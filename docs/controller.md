# Guia para crear Controladores

Esta guia explica como crear controladores en **NotBadCode API v4** siguiendo los patrones establecidos: arquitectura hexagonal, CQRS y buenas practicas de NestJS.

---

## Indice

- [Principios Fundamentales](#principios-fundamentales)
- [Estructura General](#estructura-general)
- [Anatomia de un Controlador](#anatomia-de-un-controlador)
- [Patron CQRS](#patron-cqrs)
- [BaseHandler (Normativo)](#basehandler-normativo)
- [Decoradores Disponibles](#decoradores-disponibles)
- [Requests (DTOs de Entrada)](#requests-dtos-de-entrada)
- [Responses (DTOs de Salida)](#responses-dtos-de-salida)
- [Guards de Autenticacion](#guards-de-autenticacion)
- [Documentacion Swagger](#documentacion-swagger)
- [Endpoints Paginados](#endpoints-paginados)
- [Registro en el Modulo](#registro-en-el-modulo)
- [Ejemplo Completo](#ejemplo-completo)
- [Checklist](#checklist)

---

## Principios Fundamentales

### Controladores Thin (Delgados)

Los controladores deben ser **100% thin**: solo reciben la peticion, delegan al bus correspondiente y devuelven la respuesta. **Nunca contienen logica de negocio**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPAS DE VALIDACION                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Validacion de FORMA (estructura, tipos)     →  Request DTO             │
│  Validacion de NEGOCIO (reglas, invariantes) →  Dominio / Entity        │
│  Orquestacion y flujo                        →  Handler                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Que NO hacer

```typescript
// ❌ INCORRECTO: Validar negocio en el handler si ya esta en el DTO
if (!command.payload.name) {
  return this.createResponseFailure(...);
}

// ❌ INCORRECTO: Logica de negocio en el controlador
@Post()
async create(@Body() request: CreateItemRequest) {
  if (request.price < 0) { // Esto va en el dominio
    throw new BadRequestException();
  }
}
```

### Que SI hacer

```typescript
// ✅ CORRECTO: Validacion de forma en el DTO con class-validator
export class CreateItemRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

// ✅ CORRECTO: Validacion de negocio en la entidad
export class Item {
  static create(props: CreateItemProps): Item {
    if (props.price < 0) {
      throw new DomainException('Price cannot be negative');
    }
    return new Item(props);
  }
}

// ✅ CORRECTO: Handler solo orquesta
async execute(command: CreateItemCommand): Promise<ApiResponse<ItemResponse>> {
  const item = Item.create(command.payload);
  const saved = await this.repository.save(item);
  return this.createSuccessResponse(plainToInstance(ItemResponse, saved));
}
```

---

## Estructura General

Los controladores se ubican en la raiz del directorio `src/` de cada microservicio:

```
apps/<microservicio>/
└── src/
    ├── <nombre>.controller.ts         # Controlador principal
    ├── <nombre>-healthz.controller.ts # Health check (opcional)
    ├── <nombre>.module.ts             # Modulo del microservicio
    │
    ├── application/
    │   ├── commands/                  # Commands CQRS (inmutables)
    │   ├── queries/                   # Queries CQRS (inmutables)
    │   ├── handlers/                  # Command y Query Handlers
    │   ├── requests/                  # DTOs de entrada (validacion de forma)
    │   └── responses/                 # DTOs de salida
    │
    └── domain/
        ├── entities/                  # Entidades con factory methods
        ├── ports/                     # Interfaces de repositorios
        └── services/                  # Servicios de dominio (reglas complejas)
```

---

## Anatomia de un Controlador

### Estructura Basica

```typescript
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { ApiResponse } from '@common/responses';

@Controller('recurso')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Invalid request' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
export class RecursoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // El controlador SOLO delega, nunca contiene logica
}
```

### Componentes Clave

| Componente | Descripcion |
|------------|-------------|
| `@Controller('ruta')` | Define la ruta base del controlador |
| `CommandBus` | Ejecuta Commands (operaciones de escritura) |
| `QueryBus` | Ejecuta Queries (operaciones de lectura) |
| `@UseGuards(JwtAuthGuard)` | Protege endpoints con autenticacion JWT |

---

## Patron CQRS

La API utiliza **CQRS** (Command Query Responsibility Segregation) para separar operaciones de lectura y escritura.

### Commands (Escritura) - Inmutables

Usar para: `POST`, `PUT`, `PATCH`, `DELETE`

**Los Commands deben ser completamente inmutables usando `Readonly<>`:**

```typescript
// application/commands/create-item.command.ts
import { type CreateItemRequest } from '../requests/create-item.request';

export class CreateItemCommand {
  constructor(
    public readonly payload: Readonly<CreateItemRequest>,  // ← Inmutable
    public readonly userId: number,
  ) {}
}
```

**Uso en el controlador:**

```typescript
@Post()
async create(
  @Body() request: CreateItemRequest,
  @CurrentUserId() userId: number,
): Promise<ApiResponse<ItemResponse>> {
  return this.commandBus.execute(new CreateItemCommand(request, userId));
}
```

### Queries (Lectura) - Inmutables

Usar para: `GET`

```typescript
// application/queries/get-item-by-id.query.ts
export class GetItemByIdQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
```

**Uso en el controlador:**

```typescript
@Get(':id')
async getById(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUserId() userId: number,
): Promise<ApiResponse<ItemResponse>> {
  return this.queryBus.execute(new GetItemByIdQuery(id, userId));
}
```

---

## BaseHandler (Normativo)

Todos los handlers extienden `BaseHandler`. Este es el contrato que debe respetarse:

### Garantias de BaseHandler

| Regla | Descripcion |
|-------|-------------|
| **Sin excepciones controladas** | Nunca lanzar excepciones para errores de negocio |
| **Siempre ApiResponse** | Retornar `ApiResponse<T>` en todos los casos |
| **Mensajes i18n** | Todos los mensajes deben ser claves de internacionalizacion |
| **Result Pattern** | Usar `ErrorOn<T>` para manejar errores sin excepciones |

### Metodos Disponibles

```typescript
// Respuesta exitosa
this.createSuccessResponse(data);

// Respuesta de error (con clave i18n)
this.createResponseFailure('error.key.here');

// Respuesta de error con codigo
this.createResponseFailure('error.key.here', 'ERROR_CODE');
```

### Estructura del Handler

```typescript
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler
  extends BaseHandler<CreateItemCommand, ApiResponse<ItemResponse>>
  implements ICommandHandler<CreateItemCommand, ApiResponse<ItemResponse>>
{
  constructor(
    @Inject('IItemRepository')
    private readonly itemRepository: IItemRepository,
    i18nService: I18nService,  // Requerido por BaseHandler
  ) {
    super(i18nService);
  }

  async execute(command: CreateItemCommand): Promise<ApiResponse<ItemResponse>> {
    // 1. Crear entidad usando factory method (valida invariantes)
    const item = Item.create({
      userId: command.userId,
      name: command.payload.name,
      description: command.payload.description,
    });

    // 2. Persistir
    const saved = await this.itemRepository.save(item);

    // 3. Transformar y retornar
    const response = plainToInstance(ItemResponse, saved, {
      excludeExtraneousValues: true
    });

    return this.createSuccessResponse(response);
  }
}
```

---

## Decoradores Disponibles

### Decoradores de Parametros

| Decorador | Ubicacion | Descripcion |
|-----------|-----------|-------------|
| `@CurrentUserId()` | `@common/decorators` | Obtiene el ID del usuario autenticado |
| `@CurrentAccessToken()` | `@common/decorators` | Obtiene el token de acceso actual |
| `@Body()` | `@nestjs/common` | Obtiene el cuerpo de la peticion |
| `@Param('id', ParseIntPipe)` | `@nestjs/common` | Obtiene parametros de la URL con validacion |

### Ejemplo de Uso

```typescript
import { CurrentUserId, CurrentAccessToken } from '@common/decorators';

@Post()
async create(
  @Body() request: CreateItemRequest,
  @CurrentUserId() userId: number,
): Promise<ApiResponse<ItemResponse>> {
  return this.commandBus.execute(new CreateItemCommand(request, userId));
}

@Post('logout')
async logout(
  @CurrentAccessToken() accessToken: string,
): Promise<ApiResponse<null>> {
  return this.commandBus.execute(new LogoutCommand(accessToken));
}
```

---

## Requests (DTOs de Entrada)

Los Requests definen la estructura y **validacion de forma** de los datos de entrada. **No validan reglas de negocio**.

### Ubicacion

```
apps/<microservicio>/src/application/requests/<nombre>.request.ts
```

### Estructura

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { LengthSizes } from '@common/constants';

import { ItemErrorMessageConstants } from '../../constants/item-error-message.constants';

export class CreateItemRequest {
  @ApiProperty({
    description: 'Nombre del item',
    example: 'Mi item',
    maxLength: LengthSizes.regular
  })
  @IsString({ message: ItemErrorMessageConstants.invalidName })
  @IsNotEmpty({ message: ItemErrorMessageConstants.invalidName })
  @MaxLength(LengthSizes.regular, { message: ItemErrorMessageConstants.invalidName })
  name!: string;

  @ApiPropertyOptional({
    description: 'Descripcion opcional',
    example: 'Una descripcion'
  })
  @IsOptional()
  @IsString({ message: ItemErrorMessageConstants.invalidDescription })
  @MaxLength(LengthSizes.medium, { message: ItemErrorMessageConstants.invalidDescription })
  description?: string;
}
```

### Decoradores de Validacion Comunes

| Decorador | Uso | Tipo de Validacion |
|-----------|-----|-------------------|
| `@IsString()` | Valida que sea string | Forma |
| `@IsNotEmpty()` | No permite valores vacios | Forma |
| `@IsOptional()` | Campo opcional | Forma |
| `@MaxLength(n)` | Longitud maxima | Forma |
| `@IsInt()` | Valida entero | Forma |
| `@Min(n)` | Valor minimo | Forma |
| `@IsUrl()` | Valida URL | Forma |
| `@IsBoolean()` | Valida booleano | Forma |
| `@IsArray()` | Valida array | Forma |

> **Nota**: Validaciones de **negocio** (ej: "el precio no puede ser negativo si el item es premium") van en la **entidad** o **servicio de dominio**.

---

## Responses (DTOs de Salida)

Los Responses definen la estructura de los datos de salida, usando `class-transformer` para controlar la serializacion.

### Ubicacion

```
apps/<microservicio>/src/application/responses/<nombre>.response.ts
```

### Estructura

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

type ItemResponsePartial = Partial<ItemResponse>;

@Exclude()  // Excluye todos los campos por defecto
export class ItemResponse {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Mi item' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'Descripcion del item', nullable: true })
  @Expose()
  description?: string | null;

  // ✅ Fechas siempre como ISO string para consistencia
  @ApiProperty({ example: '2026-02-07T18:22:00.000Z' })
  @Expose()
  createdAt!: string;

  @ApiProperty({ example: '2026-02-07T18:22:00.000Z' })
  @Expose()
  updatedAt!: string;

  constructor(partial?: ItemResponsePartial) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
```

### Normalizacion de Fechas

**Convencion**: Todas las fechas en responses deben ser **ISO 8601 strings**.

```typescript
// En el handler, transformar Date a string
const response = plainToInstance(ItemResponse, {
  ...saved,
  createdAt: saved.createdAt.toISOString(),
  updatedAt: saved.updatedAt.toISOString(),
}, { excludeExtraneousValues: true });
```

O usar un interceptor global para transformacion automatica.

---

## Guards de Autenticacion

### JwtAuthGuard

Protege endpoints requiriendo autenticacion JWT.

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards';

// A nivel de controlador (todos los endpoints)
@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {}

// A nivel de endpoint (solo ese endpoint)
@Controller('items')
export class ItemsController {
  @Get('public')
  getPublic() {}  // Sin autenticacion

  @Get('private')
  @UseGuards(JwtAuthGuard)
  getPrivate() {}  // Con autenticacion
}
```

### Endpoints Publicos

Para endpoints que NO requieren autenticacion (como login/register), simplemente no uses el guard:

```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  // Sin @UseGuards - endpoint publico
  async login(@Body() request: LoginRequest) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)  // Este SI requiere autenticacion
  async logout() {}
}
```

---

## Documentacion Swagger

### Decoradores Swagger Requeridos

Todos los controladores deben documentar:
- Respuestas exitosas
- Errores comunes
- Autenticacion requerida

```typescript
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

@Controller('items')
@ApiTags('Items')
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Invalid request payload' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
export class ItemsController {

  @Post()
  @ApiOkResponse({
    type: ItemResponse,
    description: 'Item created successfully'
  })
  async create() {}

  @Get(':id')
  @ApiOkResponse({
    type: ItemResponse,
    description: 'Item retrieved successfully'
  })
  @ApiNotFoundResponse({ description: 'Item not found' })
  async getById() {}
}
```

### Decoradores de Error Comunes

| Decorador | Cuando usar |
|-----------|-------------|
| `@ApiBadRequestResponse` | Validacion fallida (400) |
| `@ApiUnauthorizedResponse` | Sin autenticacion (401) |
| `@ApiForbiddenResponse` | Sin permisos (403) |
| `@ApiNotFoundResponse` | Recurso no encontrado (404) |
| `@ApiConflictResponse` | Conflicto (ej: duplicado) (409) |

---

## Endpoints Paginados

### Convencion: POST para Paginacion

En esta API usamos **POST** para endpoints paginados en lugar de GET. Esta es una decision de diseno basada en:

| Razon | Explicacion |
|-------|-------------|
| **Filtros complejos** | Los filtros pueden tener estructuras anidadas |
| **Tamano del body** | Evita URLs extremadamente largas |
| **Consistencia** | Todos los endpoints paginados funcionan igual |
| **Seguridad** | Los parametros de busqueda no quedan en logs de URL |

### Estructura

```typescript
import { PaginatedRequest } from '@common/requests';
import { createPaginatedResponse } from '@common/responses';

@Post('paginated')
@ApiOkResponse({
  type: createPaginatedResponse(ItemResponse),
  description: 'Paginated items retrieved successfully'
})
async getPaginated(
  @Body() request: PaginatedRequest,
  @CurrentUserId() userId: number,
): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
  return this.queryBus.execute(new GetItemsPaginatedQuery(request, userId));
}
```

> **Nota**: Si alguien cuestiona el uso de POST para paginacion, esta es la justificacion oficial del proyecto.

---

## Creacion de Entidades

### Usar Factory Methods, NO Object.assign

En arquitectura hexagonal, las entidades deben construirse a si mismas y validar sus invariantes.

```typescript
// ❌ INCORRECTO: Object.assign no valida invariantes
const item = Object.assign(new Item(), {
  userId: command.userId,
  name: command.payload.name,
});

// ✅ CORRECTO: Factory method con validacion
const item = Item.create({
  userId: command.userId,
  name: command.payload.name,
  price: command.payload.price,
});
```

### Ejemplo de Entidad con Factory Method

```typescript
// domain/entities/item.entity.ts
import { DomainException } from '@common/exceptions';

interface CreateItemProps {
  userId: number;
  name: string;
  description?: string;
  price: number;
}

export class Item {
  id!: number;
  userId!: number;
  name!: string;
  description!: string | null;
  price!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // Factory method - centraliza validaciones de dominio
  static create(props: CreateItemProps): Item {
    // Validaciones de NEGOCIO aqui
    if (props.price < 0) {
      throw new DomainException('Price cannot be negative');
    }

    if (props.name.length < 3) {
      throw new DomainException('Name must be at least 3 characters');
    }

    const item = new Item();
    item.userId = props.userId;
    item.name = props.name;
    item.description = props.description ?? null;
    item.price = props.price;
    item.createdAt = new Date();
    item.updatedAt = new Date();

    return item;
  }

  // Metodos de dominio para modificaciones
  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new DomainException('Price cannot be negative');
    }
    this.price = newPrice;
    this.updatedAt = new Date();
  }
}
```

### Ventajas

| Ventaja | Descripcion |
|---------|-------------|
| **Invariantes centralizadas** | Las reglas de negocio estan en un solo lugar |
| **Entidades siempre validas** | No se pueden crear entidades en estado invalido |
| **Facilita testing** | Facil de testear las reglas de negocio |
| **Codigo mas limpio** | Handlers mas simples y legibles |

---

## Registro en el Modulo

### Paso 1: Importar el Controlador

```typescript
// <microservicio>.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ItemsController } from './items.controller';
import { CreateItemHandler } from './application/handlers/create-item.handler';
import { GetItemByIdHandler } from './application/handlers/get-item-by-id.handler';

@Module({
  imports: [
    CqrsModule,  // Requerido para CQRS
    // ... otros imports
  ],
  controllers: [
    ItemsController,  // Registrar el controlador
  ],
  providers: [
    // Registrar todos los handlers
    CreateItemHandler,
    GetItemByIdHandler,

    // Registrar repositorios con inyeccion de dependencias
    {
      provide: 'IItemRepository',
      useClass: TypeOrmItemRepository,
    },
  ],
})
export class MicroservicioModule {}
```

---

## Ejemplo Completo

### 1. Controller (`items.controller.ts`)

```typescript
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CurrentUserId } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { PaginatedRequest } from '@common/requests';
import { ApiResponse, createPaginatedResponse } from '@common/responses';

import { CreateItemCommand } from './application/commands/create-item.command';
import { DeleteItemCommand } from './application/commands/delete-item.command';
import { UpdateItemCommand } from './application/commands/update-item.command';
import { GetItemByIdQuery } from './application/queries/get-item-by-id.query';
import { GetItemsPaginatedQuery } from './application/queries/get-items-paginated.query';
import { CreateItemRequest } from './application/requests/create-item.request';
import { UpdateItemRequest } from './application/requests/update-item.request';
import { ItemResponse } from './application/responses/item.response';

@Controller('items')
@ApiTags('Items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Invalid request payload' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
export class ItemsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOkResponse({ type: ItemResponse, description: 'Item created successfully' })
  async create(
    @Body() request: CreateItemRequest,
    @CurrentUserId() userId: number,
  ): Promise<ApiResponse<ItemResponse>> {
    return this.commandBus.execute(new CreateItemCommand(request, userId));
  }

  @Get(':id')
  @ApiOkResponse({ type: ItemResponse, description: 'Item retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<ApiResponse<ItemResponse>> {
    return this.queryBus.execute(new GetItemByIdQuery(id, userId));
  }

  @Post('paginated')
  @ApiOkResponse({
    type: createPaginatedResponse(ItemResponse),
    description: 'Paginated items retrieved successfully'
  })
  async getPaginated(
    @Body() request: PaginatedRequest,
    @CurrentUserId() userId: number,
  ): Promise<InstanceType<ReturnType<typeof createPaginatedResponse>>> {
    return this.queryBus.execute(new GetItemsPaginatedQuery(request, userId));
  }

  @Patch(':id')
  @ApiOkResponse({ type: ItemResponse, description: 'Item updated successfully' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateItemRequest,
    @CurrentUserId() userId: number,
  ): Promise<ApiResponse<ItemResponse>> {
    return this.commandBus.execute(new UpdateItemCommand(id, request, userId));
  }

  @Delete(':id')
  @ApiOkResponse({ type: ItemResponse, description: 'Item deleted successfully' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<ApiResponse<ItemResponse>> {
    return this.commandBus.execute(new DeleteItemCommand(id, userId));
  }
}
```

### 2. Command Inmutable (`application/commands/create-item.command.ts`)

```typescript
import { type CreateItemRequest } from '../requests/create-item.request';

export class CreateItemCommand {
  constructor(
    public readonly payload: Readonly<CreateItemRequest>,
    public readonly userId: number,
  ) {}
}
```

### 3. Query Inmutable (`application/queries/get-item-by-id.query.ts`)

```typescript
export class GetItemByIdQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
```

### 4. Command Handler (`application/handlers/create-item.handler.ts`)

```typescript
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
    // Verificar duplicados (regla de negocio que requiere BD)
    const existing = await this.itemRepository.findByName(
      command.userId,
      command.payload.name
    );

    if (existing) {
      return this.createResponseFailure(ItemErrorMessageConstants.duplicateName);
    }

    // Crear entidad con factory method (valida invariantes de dominio)
    const item = Item.create({
      userId: command.userId,
      name: command.payload.name,
      description: command.payload.description,
      price: command.payload.price,
    });

    // Persistir
    const saved = await this.itemRepository.save(item);

    // Transformar a response con fechas normalizadas
    const response = plainToInstance(ItemResponse, {
      ...saved,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    }, { excludeExtraneousValues: true });

    return this.createSuccessResponse(response);
  }
}
```

### 5. Query Handler (`application/handlers/get-item-by-id.handler.ts`)

```typescript
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
    const item = await this.itemRepository.findOne({
      where: { id: query.id, userId: query.userId }
    });

    if (!item) {
      return this.createResponseFailure(ItemErrorMessageConstants.notFound);
    }

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

## Checklist

Antes de finalizar la implementacion de un controlador, verifica:

### Controlador

- [ ] Decorador `@Controller('ruta')` con la ruta correcta
- [ ] Inyeccion de `CommandBus` y/o `QueryBus`
- [ ] `@UseGuards(JwtAuthGuard)` si requiere autenticacion
- [ ] Decoradores Swagger de errores (`@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`)
- [ ] **El controlador es 100% thin (sin logica)**

### Endpoints

- [ ] Metodo HTTP correcto (`@Get`, `@Post`, `@Patch`, `@Delete`)
- [ ] `ParseIntPipe` para parametros numericos de URL
- [ ] `@CurrentUserId()` para obtener el usuario autenticado
- [ ] Tipo de retorno `Promise<ApiResponse<T>>`
- [ ] `@ApiNotFoundResponse` para endpoints con `:id`

### CQRS

- [ ] Command/Query es **inmutable** (`Readonly<>`)
- [ ] Handler extiende `BaseHandler`
- [ ] Handler usa `createSuccessResponse` / `createResponseFailure`
- [ ] Handler **no lanza excepciones** para errores de negocio
- [ ] Handler registrado en el modulo

### DTOs

- [ ] Request valida solo **forma** (no negocio)
- [ ] Response usa `@Exclude()` a nivel de clase
- [ ] Response expone campos con `@Expose()`
- [ ] **Fechas como ISO string** en responses
- [ ] Documentacion Swagger completa

### Dominio

- [ ] Entidad usa **factory method** (`Entity.create()`)
- [ ] Invariantes de negocio en la entidad
- [ ] No se usa `Object.assign` para crear entidades

### Modulo

- [ ] Controlador registrado en `controllers`
- [ ] Handlers registrados en `providers`
- [ ] Repositorios registrados con inyeccion de dependencias

---

## Recursos Adicionales

- [Documentacion de NestJS](https://docs.nestjs.com/controllers)
- [CQRS en NestJS](https://docs.nestjs.com/recipes/cqrs)
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [Swagger en NestJS](https://docs.nestjs.com/openapi/introduction)
