# Guia para crear Repositorios

Esta guia explica como crear repositorios en **NotBadCode API v4** siguiendo el patron de puertos y adaptadores (arquitectura hexagonal).

---

## Indice

- [Principios Fundamentales](#principios-fundamentales)
- [Arquitectura de Repositorios](#arquitectura-de-repositorios)
- [Puertos (Interfaces)](#puertos-interfaces)
- [Adaptadores (Implementaciones)](#adaptadores-implementaciones)
- [Metodos Estandar](#metodos-estandar)
- [Especificaciones (Specifications)](#especificaciones-specifications)
- [Registro en el Modulo](#registro-en-el-modulo)
- [Testing](#testing)
- [Ejemplo Completo](#ejemplo-completo)
- [Checklist](#checklist)

---

## Principios Fundamentales

### Inversion de Dependencias

El dominio define **que necesita** (puerto/interfaz), la infraestructura define **como se implementa** (adaptador).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN LAYER                                  │
│                                                                         │
│   Handler ─────────► IItemRepository (Puerto/Interfaz)                  │
│                              ▲                                          │
│                              │ depende de                               │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                               │ implementa
                               │
┌──────────────────────────────┼──────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                               │
│                              │                                          │
│                    TypeOrmItemRepository                                │
│                              │                                          │
│                              ▼                                          │
│                    TypeORM Repository<Item>                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Oro

| Regla | Descripcion |
|-------|-------------|
| **El dominio no conoce TypeORM** | Las interfaces no importan nada de TypeORM |
| **Adaptadores intercambiables** | Puedes cambiar de TypeORM a Prisma sin tocar handlers |
| **Un puerto por entidad** | `ILinkRepository`, `IGroupLinkRepository`, etc. |
| **Metodos especificos** | Añadir metodos de dominio, no solo CRUD generico |

---

## Arquitectura de Repositorios

### Estructura de Archivos

```
apps/<microservicio>/
└── src/
    ├── domain/
    │   └── ports/
    │       ├── item-repository.port.ts      # Interfaz (Puerto)
    │       └── index.ts
    │
    └── infrastructure/
        └── repositories/
            ├── typeorm-item.repository.ts   # Implementacion (Adaptador)
            └── index.ts
```

### Flujo de Datos

```
Controller → Handler → Puerto (Interface) ← Adaptador (TypeORM) ← Database
                           ↑
                    Inyeccion de
                    Dependencias
```

---

## Puertos (Interfaces)

Los puertos definen el **contrato** que debe cumplir cualquier implementacion.

### Ubicacion

```
apps/<microservicio>/src/domain/ports/<entity>-repository.port.ts
```

### Estructura

```typescript
// domain/ports/item-repository.port.ts
import { type FindOneOptions, type FindOptionsOrder, type FindOptionsWhere } from 'typeorm';

import { type Item } from '../entities/item.entity';

export interface IItemRepository {
  // Consultas
  findOne(options: FindOneOptions<Item>): Promise<Item | null>;
  findAndCount(options: {
    skip: number;
    take: number;
    order?: FindOptionsOrder<Item>;
    where?: FindOptionsWhere<Item>;
    relations?: string[];
  }): Promise<[Item[], number]>;
  find(options: {
    select?: (keyof Item)[];
    where: FindOptionsWhere<Item>;
  }): Promise<Item[]>;

  // Persistencia
  save(item: Item): Promise<Item>;
  update(
    criteria: FindOptionsWhere<Item>,
    data: Partial<Item>
  ): Promise<{ affected?: number }>;
  softDelete(
    criteria: Pick<Item, 'id' | 'userId'>
  ): Promise<{ affected?: number }>;
}
```

### Convencion de Nombres

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Interface | `I{Entity}Repository` | `ILinkRepository` |
| Archivo | `{entity}-repository.port.ts` | `link-repository.port.ts` |

### Tipos de TypeORM Permitidos

Aunque el puerto esta en el dominio, se permite usar tipos de TypeORM para las options:

```typescript
import {
  type FindOneOptions,
  type FindOptionsOrder,
  type FindOptionsWhere
} from 'typeorm';
```

> **Nota**: Esto es una concesion practica. En DDD estricto, definirias tus propios tipos.

---

## Adaptadores (Implementaciones)

Los adaptadores implementan los puertos usando TypeORM.

### Ubicacion

```
apps/<microservicio>/src/infrastructure/repositories/typeorm-<entity>.repository.ts
```

### Estructura

```typescript
// infrastructure/repositories/typeorm-item.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type FindOneOptions,
  type FindOptionsOrder,
  type FindOptionsWhere,
  Repository
} from 'typeorm';

import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { Item } from '../../domain/entities/item.entity';

@Injectable()
export class TypeOrmItemRepository implements IItemRepository {
  constructor(
    @InjectRepository(Item)
    private readonly repository: Repository<Item>,
  ) {}

  async findOne(options: FindOneOptions<Item>): Promise<Item | null> {
    return this.repository.findOne(options);
  }

  async findAndCount(options: {
    skip: number;
    take: number;
    order?: FindOptionsOrder<Item>;
    where?: FindOptionsWhere<Item>;
    relations?: string[];
  }): Promise<[Item[], number]> {
    return this.repository.findAndCount(options);
  }

  async find(options: {
    select?: (keyof Item)[];
    where: FindOptionsWhere<Item>;
  }): Promise<Item[]> {
    return this.repository.find(options);
  }

  async save(item: Item): Promise<Item> {
    return this.repository.save(item);
  }

  async update(
    criteria: FindOptionsWhere<Item>,
    data: Partial<Item>
  ): Promise<{ affected?: number }> {
    return this.repository.update(criteria, data);
  }

  async softDelete(
    criteria: Pick<Item, 'id' | 'userId'>
  ): Promise<{ affected?: number }> {
    return this.repository.softDelete(criteria);
  }
}
```

### Convencion de Nombres

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Clase | `TypeOrm{Entity}Repository` | `TypeOrmLinkRepository` |
| Archivo | `typeorm-{entity}.repository.ts` | `typeorm-link.repository.ts` |

---

## Metodos Estandar

### Metodos Base

Todo repositorio debe implementar estos metodos base:

| Metodo | Descripcion | Retorno |
|--------|-------------|---------|
| `findOne(options)` | Buscar una entidad | `Entity \| null` |
| `findAndCount(options)` | Buscar con conteo (paginacion) | `[Entity[], number]` |
| `find(options)` | Buscar multiples | `Entity[]` |
| `save(entity)` | Crear o actualizar | `Entity` |
| `update(criteria, data)` | Actualizar parcial | `{ affected?: number }` |
| `softDelete(criteria)` | Eliminacion logica | `{ affected?: number }` |

### Metodos de Dominio (Especificos)

Añadir metodos que tengan sentido para el dominio:

```typescript
export interface IItemRepository {
  // ... metodos base ...

  // Metodos especificos de dominio
  findByName(userId: number, name: string): Promise<Item | null>;
  findActiveByUser(userId: number): Promise<Item[]>;
  findFavorites(userId: number): Promise<Item[]>;
  countByUser(userId: number): Promise<number>;
}
```

### Implementacion de Metodos de Dominio

```typescript
@Injectable()
export class TypeOrmItemRepository implements IItemRepository {
  // ... metodos base ...

  async findByName(userId: number, name: string): Promise<Item | null> {
    return this.repository.findOne({
      where: { userId, name }
    });
  }

  async findActiveByUser(userId: number): Promise<Item[]> {
    return this.repository.find({
      where: { userId, isActive: true }
    });
  }

  async findFavorites(userId: number): Promise<Item[]> {
    return this.repository.find({
      where: { userId, isFavorite: true },
      order: { createdAt: 'DESC' }
    });
  }

  async countByUser(userId: number): Promise<number> {
    return this.repository.count({
      where: { userId }
    });
  }
}
```

---

## Especificaciones (Specifications)

Las especificaciones encapsulan criterios de busqueda reutilizables.

### Ubicacion

```
apps/<microservicio>/src/domain/specifications/<nombre>.specification.ts
```

### Estructura

```typescript
// domain/specifications/item-by-id.specification.ts
import { type FindOneOptions } from 'typeorm';

import { type Item } from '../entities/item.entity';

export class ItemByIdSpecification {
  static options(id: number, userId: number): FindOneOptions<Item> {
    return {
      where: { id, userId },
    };
  }
}
```

### Especificacion con Relaciones

```typescript
// domain/specifications/item-with-group.specification.ts
import { type FindOneOptions } from 'typeorm';

import { type Item } from '../entities/item.entity';

export class ItemWithGroupSpecification {
  static options(id: number, userId: number): FindOneOptions<Item> {
    return {
      where: { id, userId },
      relations: ['group'],
    };
  }
}
```

### Especificacion para Listas

```typescript
// domain/specifications/active-items.specification.ts
import { type FindOptionsWhere } from 'typeorm';

import { type Item } from '../entities/item.entity';

export class ActiveItemsSpecification {
  static where(userId: number): FindOptionsWhere<Item> {
    return {
      userId,
      isActive: true,
    };
  }
}
```

### Uso en Handlers

```typescript
// En el handler
const item = await this.itemRepository.findOne(
  ItemByIdSpecification.options(query.id, query.userId)
);

const items = await this.itemRepository.find({
  where: ActiveItemsSpecification.where(query.userId)
});
```

---

## Registro en el Modulo

### Paso 1: Importar TypeOrmModule

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, GroupItem]),  // Entidades
    // ...
  ],
})
```

### Paso 2: Registrar el Adaptador

```typescript
import { TypeOrmItemRepository } from './infrastructure/repositories/typeorm-item.repository';

@Module({
  providers: [
    // Vincular interfaz con implementacion
    {
      provide: 'IItemRepository',
      useClass: TypeOrmItemRepository,
    },
  ],
})
```

### Ejemplo Completo de Modulo

```typescript
// items.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Item } from './domain/entities/item.entity';
import { GroupItem } from './domain/entities/group-item.entity';

import { TypeOrmItemRepository } from './infrastructure/repositories/typeorm-item.repository';
import { TypeOrmGroupItemRepository } from './infrastructure/repositories/typeorm-group-item.repository';

import { CreateItemHandler } from './application/handlers/create-item.handler';
import { GetItemByIdHandler } from './application/handlers/get-item-by-id.handler';

import { ItemsController } from './items.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Item, GroupItem]),
  ],
  controllers: [ItemsController],
  providers: [
    // Handlers
    CreateItemHandler,
    GetItemByIdHandler,

    // Repositorios
    {
      provide: 'IItemRepository',
      useClass: TypeOrmItemRepository,
    },
    {
      provide: 'IGroupItemRepository',
      useClass: TypeOrmGroupItemRepository,
    },
  ],
})
export class ItemsModule {}
```

---

## Testing

### Mock del Repositorio

```typescript
import { mock, type MockProxy } from 'jest-mock-extended';

import { type IItemRepository } from '../../domain/ports/item-repository.port';

describe('CreateItemHandler', () => {
  let itemRepository: MockProxy<IItemRepository>;

  beforeEach(() => {
    itemRepository = mock<IItemRepository>();
  });

  it('should create item', async () => {
    // Arrange
    itemRepository.findByName.mockResolvedValue(null);
    itemRepository.save.mockResolvedValue(mockItem);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(itemRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test' })
    );
  });
});
```

### Test del Repositorio (Integracion)

```typescript
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeOrmItemRepository } from './typeorm-item.repository';
import { Item } from '../../domain/entities/item.entity';

describe('TypeOrmItemRepository (Integration)', () => {
  let repository: TypeOrmItemRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Item],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Item]),
      ],
      providers: [TypeOrmItemRepository],
    }).compile();

    repository = module.get(TypeOrmItemRepository);
  });

  it('should save and find item', async () => {
    const item = Item.create({ userId: 1, name: 'Test' });
    const saved = await repository.save(item);

    const found = await repository.findOne({ where: { id: saved.id } });

    expect(found).toBeDefined();
    expect(found?.name).toBe('Test');
  });
});
```

---

## Ejemplo Completo

### Puerto (Interfaz)

```typescript
// domain/ports/item-repository.port.ts
import {
  type FindOneOptions,
  type FindOptionsOrder,
  type FindOptionsWhere
} from 'typeorm';

import { type Item } from '../entities/item.entity';

export interface IItemRepository {
  // Consultas base
  findOne(options: FindOneOptions<Item>): Promise<Item | null>;
  findAndCount(options: {
    skip: number;
    take: number;
    order?: FindOptionsOrder<Item>;
    where?: FindOptionsWhere<Item>;
    relations?: string[];
  }): Promise<[Item[], number]>;
  find(options: {
    select?: (keyof Item)[];
    where: FindOptionsWhere<Item>;
  }): Promise<Item[]>;

  // Persistencia
  save(item: Item): Promise<Item>;
  update(
    criteria: FindOptionsWhere<Item>,
    data: Partial<Item>
  ): Promise<{ affected?: number }>;
  softDelete(
    criteria: Pick<Item, 'id' | 'userId'>
  ): Promise<{ affected?: number }>;

  // Metodos de dominio
  findByName(userId: number, name: string): Promise<Item | null>;
  findActiveByUser(userId: number): Promise<Item[]>;
  findFavorites(userId: number): Promise<Item[]>;
}
```

### Adaptador (Implementacion)

```typescript
// infrastructure/repositories/typeorm-item.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type FindOneOptions,
  type FindOptionsOrder,
  type FindOptionsWhere,
  Repository
} from 'typeorm';

import { type IItemRepository } from '../../domain/ports/item-repository.port';
import { Item } from '../../domain/entities/item.entity';

@Injectable()
export class TypeOrmItemRepository implements IItemRepository {
  constructor(
    @InjectRepository(Item)
    private readonly repository: Repository<Item>,
  ) {}

  // Consultas base
  async findOne(options: FindOneOptions<Item>): Promise<Item | null> {
    return this.repository.findOne(options);
  }

  async findAndCount(options: {
    skip: number;
    take: number;
    order?: FindOptionsOrder<Item>;
    where?: FindOptionsWhere<Item>;
    relations?: string[];
  }): Promise<[Item[], number]> {
    return this.repository.findAndCount(options);
  }

  async find(options: {
    select?: (keyof Item)[];
    where: FindOptionsWhere<Item>;
  }): Promise<Item[]> {
    return this.repository.find(options);
  }

  // Persistencia
  async save(item: Item): Promise<Item> {
    return this.repository.save(item);
  }

  async update(
    criteria: FindOptionsWhere<Item>,
    data: Partial<Item>
  ): Promise<{ affected?: number }> {
    return this.repository.update(criteria, data);
  }

  async softDelete(
    criteria: Pick<Item, 'id' | 'userId'>
  ): Promise<{ affected?: number }> {
    return this.repository.softDelete(criteria);
  }

  // Metodos de dominio
  async findByName(userId: number, name: string): Promise<Item | null> {
    return this.repository.findOne({
      where: { userId, name }
    });
  }

  async findActiveByUser(userId: number): Promise<Item[]> {
    return this.repository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findFavorites(userId: number): Promise<Item[]> {
    return this.repository.find({
      where: { userId, isFavorite: true },
      order: { createdAt: 'DESC' }
    });
  }
}
```

### Especificacion

```typescript
// domain/specifications/item-by-id.specification.ts
import { type FindOneOptions } from 'typeorm';

import { type Item } from '../entities/item.entity';

export class ItemByIdSpecification {
  static options(id: number, userId: number): FindOneOptions<Item> {
    return {
      where: { id, userId },
    };
  }

  static withRelations(id: number, userId: number): FindOneOptions<Item> {
    return {
      where: { id, userId },
      relations: ['group', 'tags'],
    };
  }
}
```

---

## Checklist

Antes de finalizar un repositorio, verifica:

### Puerto (Interfaz)

- [ ] Ubicado en `domain/ports/`
- [ ] Nombre: `I{Entity}Repository`
- [ ] Archivo: `{entity}-repository.port.ts`
- [ ] Metodos base implementados
- [ ] Metodos de dominio definidos si necesarios

### Adaptador (Implementacion)

- [ ] Ubicado en `infrastructure/repositories/`
- [ ] Nombre: `TypeOrm{Entity}Repository`
- [ ] Archivo: `typeorm-{entity}.repository.ts`
- [ ] Decorador `@Injectable()`
- [ ] Inyecta `Repository<Entity>` con `@InjectRepository`
- [ ] Implementa la interfaz del puerto

### Modulo

- [ ] Entidad registrada en `TypeOrmModule.forFeature()`
- [ ] Repositorio registrado en `providers` con `provide/useClass`

### Testing

- [ ] Mock creado con `jest-mock-extended`
- [ ] Tests unitarios para handlers
- [ ] Tests de integracion para el repositorio (opcional)

---

## Recursos Adicionales

- [TypeORM Repository API](https://typeorm.io/repository-api)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
