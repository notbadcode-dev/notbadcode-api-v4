# Guia para crear Entidades

Esta guia explica como crear entidades de dominio en **NotBadCode API v4** siguiendo los principios de Domain-Driven Design (DDD) y arquitectura hexagonal.

---

## Indice

- [Principios Fundamentales](#principios-fundamentales)
- [Entidades Base](#entidades-base)
- [Estructura de una Entidad](#estructura-de-una-entidad)
- [Factory Methods](#factory-methods)
- [Metodos de Dominio](#metodos-de-dominio)
- [Decoradores TypeORM](#decoradores-typeorm)
- [Columnas Personalizadas](#columnas-personalizadas)
- [Relaciones](#relaciones)
- [Indices](#indices)
- [Enums](#enums)
- [Ejemplo Completo](#ejemplo-completo)
- [Checklist](#checklist)

---

## Principios Fundamentales

### Entidades Ricas vs Anemicas

Las entidades deben contener **logica de negocio**, no ser simples contenedores de datos.

```typescript
// ❌ Entidad ANEMICA (solo datos)
class Item {
  id: number;
  name: string;
  price: number;
}

// ✅ Entidad RICA (datos + comportamiento)
class Item {
  id: number;
  name: string;
  price: number;

  static create(props: CreateItemProps): Item { ... }
  updatePrice(newPrice: number): void { ... }
  markAsFavorite(): void { ... }
}
```

### Reglas de Oro

| Regla | Descripcion |
|-------|-------------|
| **Factory methods** | Usar `Entity.create()` en lugar de `new Entity()` |
| **Invariantes en la entidad** | Las reglas de negocio se validan en la entidad |
| **Entidades siempre validas** | No se pueden crear entidades en estado invalido |
| **Inmutabilidad controlada** | Cambios solo a traves de metodos de dominio |
| **Sin dependencias externas** | Las entidades no dependen de servicios |

---

## Entidades Base

El proyecto proporciona dos clases base que todas las entidades deben extender.

### AuditableEntity

Entidad base con campos de auditoria:

```typescript
// libs/common/src/database/entities/auditable.entity.ts
export abstract class AuditableEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @CreateDateColumn(ColumnDateTimeNonNullable())
  createdAt!: Date;

  @UpdateDateColumn(ColumnDateTimeNonNullable())
  updatedAt!: Date;
}
```

### DeletableEntity

Extiende AuditableEntity con soft delete:

```typescript
// libs/common/src/database/entities/deletable.entity.ts
export abstract class DeletableEntity extends AuditableEntity {
  @DeleteDateColumn(ColumnDateTimeNullable())
  deletedAt?: Date;
}
```

### Cuando usar cada una

| Entidad Base | Usar cuando |
|--------------|-------------|
| `AuditableEntity` | Registros que se eliminan fisicamente |
| `DeletableEntity` | Registros con soft delete (recomendado) |

---

## Estructura de una Entidad

### Ubicacion

```
apps/<microservicio>/src/domain/entities/<entity>.entity.ts
```

### Estructura Basica

```typescript
// domain/entities/item.entity.ts
import { Column, Entity, Index } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import { ColumnBoolean, ColumnVarchar } from '@common/database/configurations/column-types';

@Entity({ name: 'items' })
@Index('IX_items_userId', ['userId'])
export class Item extends DeletableEntity {
  // Campos heredados de DeletableEntity:
  // - id: number
  // - createdAt: Date
  // - updatedAt: Date
  // - deletedAt?: Date

  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column(ColumnVarchar(LengthSizes.regular))
  name!: string;

  @Column(ColumnVarchar(LengthSizes.medium, true))
  description?: string | null;

  @Column(ColumnBoolean())
  isActive!: boolean;
}
```

---

## Factory Methods

### Por que usar Factory Methods

```typescript
// ❌ INCORRECTO: No valida invariantes
const item = new Item();
item.name = '';  // Estado invalido permitido
item.price = -100;  // Estado invalido permitido

// ❌ INCORRECTO: Object.assign no valida
const item = Object.assign(new Item(), {
  name: '',
  price: -100,
});

// ✅ CORRECTO: Factory method con validacion
const item = Item.create({
  name: 'Valid Name',
  price: 100,
});  // Lanza excepcion si los datos son invalidos
```

### Implementacion

```typescript
// domain/entities/item.entity.ts
import { Column, Entity, Index } from 'typeorm';

import { DeletableEntity } from '@common/database';
import { DomainException } from '@common/exceptions';

interface CreateItemProps {
  userId: number;
  name: string;
  description?: string;
  price: number;
}

@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea una nueva instancia de Item validando invariantes de dominio.
   * @throws DomainException si los datos violan alguna regla de negocio
   */
  static create(props: CreateItemProps): Item {
    // Validar invariantes
    Item.validateName(props.name);
    Item.validatePrice(props.price);

    // Crear instancia
    const item = new Item();
    item.userId = props.userId;
    item.name = props.name.trim();
    item.description = props.description?.trim() ?? null;
    item.price = props.price;
    item.isActive = true;

    return item;
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES PRIVADAS
  // ═══════════════════════════════════════════════════════════════

  private static validateName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new DomainException('Item name must be at least 3 characters');
    }
    if (name.length > 255) {
      throw new DomainException('Item name cannot exceed 255 characters');
    }
  }

  private static validatePrice(price: number): void {
    if (price < 0) {
      throw new DomainException('Item price cannot be negative');
    }
    if (price > 999999.99) {
      throw new DomainException('Item price exceeds maximum allowed');
    }
  }
}
```

---

## Metodos de Dominio

Los metodos de dominio encapsulan operaciones de negocio y validan invariantes.

### Actualizacion de Campos

```typescript
@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  // ... campos ...

  // ═══════════════════════════════════════════════════════════════
  // METODOS DE DOMINIO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Actualiza el nombre del item.
   * @throws DomainException si el nombre es invalido
   */
  updateName(name: string): void {
    Item.validateName(name);
    this.name = name.trim();
  }

  /**
   * Actualiza la descripcion del item.
   */
  updateDescription(description: string | null): void {
    this.description = description?.trim() ?? null;
  }

  /**
   * Actualiza el precio del item.
   * @throws DomainException si el precio es invalido
   */
  updatePrice(price: number): void {
    Item.validatePrice(price);
    this.price = price;
  }
}
```

### Operaciones de Estado

```typescript
@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @Column({ type: 'boolean', default: false })
  isFavorite!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ═══════════════════════════════════════════════════════════════
  // OPERACIONES DE ESTADO
  // ═══════════════════════════════════════════════════════════════

  markAsFavorite(): void {
    this.isFavorite = true;
  }

  unmarkAsFavorite(): void {
    this.isFavorite = false;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Verifica si el item puede ser eliminado.
   * @throws DomainException si el item tiene dependencias
   */
  ensureCanBeDeleted(): void {
    if (this.hasActiveDependencies()) {
      throw new DomainException('Cannot delete item with active dependencies');
    }
  }

  private hasActiveDependencies(): boolean {
    // Logica de negocio
    return false;
  }
}
```

### Metodos de Consulta (Getters de Negocio)

```typescript
@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  // ═══════════════════════════════════════════════════════════════
  // METODOS DE CONSULTA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Indica si el item es considerado premium.
   */
  isPremium(): boolean {
    return this.price > 1000;
  }

  /**
   * Indica si el item es popular basado en vistas.
   */
  isPopular(): boolean {
    return this.viewCount > 100;
  }

  /**
   * Indica si el item esta disponible para compra.
   */
  isAvailable(): boolean {
    return this.isActive && !this.deletedAt;
  }
}
```

---

## Decoradores TypeORM

### Decoradores de Entidad

```typescript
@Entity({ name: 'items' })  // Nombre de tabla en BD
export class Item extends DeletableEntity { }
```

### Decoradores de Columna

| Decorador | Uso |
|-----------|-----|
| `@Column()` | Columna basica |
| `@PrimaryGeneratedColumn()` | ID autoincremental (heredado) |
| `@CreateDateColumn()` | Fecha de creacion automatica (heredado) |
| `@UpdateDateColumn()` | Fecha de actualizacion automatica (heredado) |
| `@DeleteDateColumn()` | Fecha de soft delete (heredado) |

### Tipos de Columna Comunes

```typescript
// Entero
@Column({ type: 'int', unsigned: true })
userId!: number;

// String con longitud
@Column({ type: 'varchar', length: 255 })
name!: string;

// String nullable
@Column({ type: 'varchar', length: 500, nullable: true })
description!: string | null;

// Booleano
@Column({ type: 'boolean', default: false })
isActive!: boolean;

// Decimal
@Column({ type: 'decimal', precision: 10, scale: 2 })
price!: number;

// Enum
@Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.PENDING })
status!: ItemStatus;

// JSON
@Column({ type: 'json', default: [] })
tags!: string[];

// Fecha nullable
@Column({ type: 'datetime', nullable: true })
publishedAt!: Date | null;
```

---

## Columnas Personalizadas

El proyecto proporciona funciones helper para tipos de columna comunes.

### Ubicacion

```
libs/common/src/database/configurations/column-types.ts
```

### Helpers Disponibles

```typescript
import {
  ColumnVarchar,
  ColumnBoolean,
  ColumnDateTimeNullable,
  ColumnDateTimeNonNullable,
  ColumnEnumNonNullable,
  ColumnJsonArray,
  ColumnJsonRgb,
} from '@common/database/configurations/column-types';
```

### Uso

```typescript
import { Column, Entity } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import {
  ColumnBoolean,
  ColumnVarchar,
  ColumnDateTimeNullable,
  ColumnEnumNonNullable,
  ColumnJsonArray,
} from '@common/database/configurations/column-types';

import { ItemStatus } from '../enums/item-status.enum';

@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @Column(ColumnVarchar(LengthSizes.regular))
  name!: string;

  @Column(ColumnVarchar(LengthSizes.medium, true))  // nullable
  description?: string | null;

  @Column(ColumnBoolean())
  isActive!: boolean;

  @Column(ColumnBoolean(true))  // default: true
  isPublic!: boolean;

  @Column(ColumnDateTimeNullable())
  publishedAt?: Date | null;

  @Column(ColumnEnumNonNullable(ItemStatus, ItemStatus.DRAFT))
  status!: ItemStatus;

  @Column(ColumnJsonArray())
  tags!: string[];
}
```

### LengthSizes (Constantes de Longitud)

```typescript
// libs/common/src/constants/length-sizes.constant.ts
export const LengthSizes = {
  tiny: 50,       // Codigos, siglas
  small: 100,     // Nombres cortos
  regular: 255,   // Nombres, titulos
  medium: 500,    // Descripciones cortas
  large: 1000,    // Descripciones largas
  extraLarge: 2000, // URLs, textos largos
} as const;
```

---

## Relaciones

### ManyToOne (N:1)

```typescript
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

import { DeletableEntity } from '@common/database';
import { GroupItem } from './group-item.entity';

@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @Column({ type: 'int', unsigned: true, nullable: true })
  groupId?: number | null;

  @ManyToOne(() => GroupItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'groupId' })
  group?: GroupItem | null;
}
```

### OneToMany (1:N)

```typescript
import { Entity, OneToMany } from 'typeorm';

import { DeletableEntity } from '@common/database';
import { Item } from './item.entity';

@Entity({ name: 'group_items' })
export class GroupItem extends DeletableEntity {
  @OneToMany(() => Item, (item) => item.group)
  items?: Item[];
}
```

### ManyToMany (N:M)

```typescript
import { Entity, ManyToMany, JoinTable } from 'typeorm';

import { DeletableEntity } from '@common/database';
import { Tag } from './tag.entity';

@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'item_tags',
    joinColumn: { name: 'itemId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags?: Tag[];
}
```

---

## Indices

### Indice Simple

```typescript
@Entity({ name: 'items' })
@Index('IX_items_userId', ['userId'])
export class Item extends DeletableEntity { }
```

### Indice Compuesto

```typescript
@Entity({ name: 'items' })
@Index('IX_items_userId_status', ['userId', 'status'])
export class Item extends DeletableEntity { }
```

### Indice Unico

```typescript
@Entity({ name: 'items' })
@Index('UX_items_userId_name', ['userId', 'name'], { unique: true })
export class Item extends DeletableEntity { }
```

### Multiples Indices

```typescript
@Entity({ name: 'items' })
@Index('IX_items_userId', ['userId'])
@Index('IX_items_status', ['status'])
@Index('IX_items_isActive', ['isActive'])
@Index('UX_items_userId_slug', ['userId', 'slug'], { unique: true })
export class Item extends DeletableEntity { }
```

### Convencion de Nombres

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Indice normal | `IX_` | `IX_items_userId` |
| Indice unico | `UX_` | `UX_items_email` |
| Foreign key | `FK_` | `FK_items_groupId` |

---

## Enums

### Ubicacion

```
apps/<microservicio>/src/domain/enums/<enum-name>.enum.ts
```

### Definicion

```typescript
// domain/enums/item-status.enum.ts
export enum ItemStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

### Uso en Entidad

```typescript
import { Column, Entity } from 'typeorm';

import { ColumnEnumNonNullable } from '@common/database/configurations/column-types';
import { ItemStatus } from '../enums/item-status.enum';

@Entity({ name: 'items' })
export class Item extends DeletableEntity {
  @Column(ColumnEnumNonNullable(ItemStatus, ItemStatus.DRAFT))
  status!: ItemStatus;

  // Metodo de dominio para cambiar estado
  publish(): void {
    if (this.status !== ItemStatus.PENDING) {
      throw new DomainException('Only pending items can be published');
    }
    this.status = ItemStatus.PUBLISHED;
  }
}
```

---

## Ejemplo Completo

```typescript
// domain/entities/item.entity.ts
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';

import { LengthSizes } from '@common/constants';
import { DeletableEntity } from '@common/database';
import {
  ColumnBoolean,
  ColumnVarchar,
  ColumnDateTimeNullable,
  ColumnEnumNonNullable,
  ColumnJsonArray,
} from '@common/database/configurations/column-types';
import { DomainException } from '@common/exceptions';

import { ItemStatus } from '../enums/item-status.enum';
import { GroupItem } from './group-item.entity';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface CreateItemProps {
  userId: number;
  name: string;
  description?: string;
  price: number;
  groupId?: number | null;
  tags?: string[];
}

interface UpdateItemProps {
  name?: string;
  description?: string | null;
  price?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY
// ═══════════════════════════════════════════════════════════════════════════

@Entity({ name: 'items' })
@Index('IX_items_userId', ['userId'])
@Index('IX_items_groupId', ['groupId'])
@Index('IX_items_status', ['status'])
@Index('IX_items_isFavorite', ['isFavorite'])
@Index('UX_items_userId_slug', ['userId', 'slug'], { unique: true })
export class Item extends DeletableEntity {
  // ═══════════════════════════════════════════════════════════════
  // CAMPOS
  // ═══════════════════════════════════════════════════════════════

  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  groupId?: number | null;

  @ManyToOne(() => GroupItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'groupId' })
  group?: GroupItem | null;

  @Column(ColumnVarchar(LengthSizes.regular))
  name!: string;

  @Column(ColumnVarchar(LengthSizes.regular, true))
  slug?: string | null;

  @Column(ColumnVarchar(LengthSizes.medium, true))
  description?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column(ColumnEnumNonNullable(ItemStatus, ItemStatus.DRAFT))
  status!: ItemStatus;

  @Column(ColumnBoolean())
  isFavorite!: boolean;

  @Column(ColumnBoolean(true))
  isActive!: boolean;

  @Column(ColumnJsonArray())
  tags!: string[];

  @Column(ColumnDateTimeNullable())
  publishedAt?: Date | null;

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea una nueva instancia de Item.
   * @throws DomainException si los datos violan reglas de negocio
   */
  static create(props: CreateItemProps): Item {
    Item.validateName(props.name);
    Item.validatePrice(props.price);

    const item = new Item();
    item.userId = props.userId;
    item.name = props.name.trim();
    item.slug = Item.generateSlug(props.name);
    item.description = props.description?.trim() ?? null;
    item.price = props.price;
    item.status = ItemStatus.DRAFT;
    item.isFavorite = false;
    item.isActive = true;
    item.tags = props.tags ?? [];
    item.groupId = props.groupId ?? null;
    item.publishedAt = null;

    return item;
  }

  // ═══════════════════════════════════════════════════════════════
  // METODOS DE DOMINIO - ACTUALIZACION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Actualiza los campos del item.
   */
  update(props: UpdateItemProps): void {
    if (props.name !== undefined) {
      Item.validateName(props.name);
      this.name = props.name.trim();
      this.slug = Item.generateSlug(props.name);
    }

    if (props.description !== undefined) {
      this.description = props.description?.trim() ?? null;
    }

    if (props.price !== undefined) {
      Item.validatePrice(props.price);
      this.price = props.price;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // METODOS DE DOMINIO - ESTADO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Envia el item a revision.
   */
  submitForReview(): void {
    if (this.status !== ItemStatus.DRAFT) {
      throw new DomainException('Only draft items can be submitted for review');
    }
    this.status = ItemStatus.PENDING;
  }

  /**
   * Publica el item.
   */
  publish(): void {
    if (this.status !== ItemStatus.PENDING) {
      throw new DomainException('Only pending items can be published');
    }
    this.status = ItemStatus.PUBLISHED;
    this.publishedAt = new Date();
  }

  /**
   * Archiva el item.
   */
  archive(): void {
    if (this.status === ItemStatus.ARCHIVED) {
      throw new DomainException('Item is already archived');
    }
    this.status = ItemStatus.ARCHIVED;
  }

  /**
   * Marca como favorito.
   */
  markAsFavorite(): void {
    this.isFavorite = true;
  }

  /**
   * Desmarca como favorito.
   */
  unmarkAsFavorite(): void {
    this.isFavorite = false;
  }

  // ═══════════════════════════════════════════════════════════════
  // METODOS DE CONSULTA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Indica si el item es premium.
   */
  isPremium(): boolean {
    return this.price > 1000;
  }

  /**
   * Indica si el item esta publicado.
   */
  isPublished(): boolean {
    return this.status === ItemStatus.PUBLISHED;
  }

  /**
   * Indica si el item puede ser editado.
   */
  canBeEdited(): boolean {
    return this.status === ItemStatus.DRAFT || this.status === ItemStatus.PENDING;
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES PRIVADAS
  // ═══════════════════════════════════════════════════════════════

  private static validateName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new DomainException('Item name must be at least 3 characters');
    }
    if (name.length > LengthSizes.regular) {
      throw new DomainException(`Item name cannot exceed ${LengthSizes.regular} characters`);
    }
  }

  private static validatePrice(price: number): void {
    if (price < 0) {
      throw new DomainException('Item price cannot be negative');
    }
    if (price > 999999.99) {
      throw new DomainException('Item price exceeds maximum allowed');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ═══════════════════════════════════════════════════════════════

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
```

---

## Checklist

Antes de finalizar una entidad, verifica:

### Estructura

- [ ] Ubicada en `domain/entities/`
- [ ] Extiende `DeletableEntity` o `AuditableEntity`
- [ ] Decorador `@Entity({ name: 'tabla' })`
- [ ] Indices definidos con `@Index()`

### Factory Method

- [ ] Tiene `static create(props)` method
- [ ] Valida invariantes de dominio
- [ ] No permite crear entidades invalidas
- [ ] Props tipado con interface

### Metodos de Dominio

- [ ] Actualizaciones via metodos (no asignacion directa)
- [ ] Validaciones en cada metodo que lo requiera
- [ ] Metodos de consulta para logica de negocio

### Columnas

- [ ] Usa helpers de `@common/database/configurations`
- [ ] Longitudes definidas con `LengthSizes`
- [ ] Campos nullable marcados con `?` y `null` en tipo
- [ ] Relaciones con `onDelete` definido

### Enums

- [ ] Definidos en `domain/enums/`
- [ ] Valores en minusculas (convencion)
- [ ] Usados con `ColumnEnumNonNullable`

---

## Recursos Adicionales

- [TypeORM Entity Documentation](https://typeorm.io/entities)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Rich Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html)
