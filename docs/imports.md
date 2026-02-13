# Guia de Imports

Esta guia define como se deben importar modulos y ficheros en **NotBadCode API v4**.

---

## Reglas Principales

### 1. Siempre usar path aliases (`@...`), nunca rutas relativas (`../`)

```typescript
// MAL
import { Link } from '../../domain/entities/link.entity';
import { LinksErrorMessageConstants } from '../../../constants/links-error-message.constants';

// BIEN
import { Link } from '@apps/links/src/domain/entities';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
```

### 2. Importar desde el barrel (`index.ts`), nunca desde el fichero individual

```typescript
// MAL
import { CreateLinkCommand } from '@apps/links/src/application/commands/create-link.command';
import { GetLinkByIdQuery } from '@apps/links/src/application/queries/get-link-by-id.query';

// BIEN
import { CreateLinkCommand } from '@apps/links/src/application/commands';
import { GetLinkByIdQuery } from '@apps/links/src/application/queries';
```

### 3. Consolidar imports del mismo modulo en una sola linea

```typescript
// MAL
import { Link } from '@apps/links/src/domain/entities';
import { GroupLink } from '@apps/links/src/domain/entities';

// BIEN
import { GroupLink, Link } from '@apps/links/src/domain/entities';
```

### 4. Unica excepcion: imports `./` dentro de la misma carpeta

Los imports con `./` (misma carpeta) son aceptables cuando se importa un fichero hermano en el mismo directorio que NO tiene barrel:

```typescript
// Aceptable dentro de domain/entities/link.entity.ts
import { GroupLink } from './group-link.entity';
```

Pero si la carpeta tiene un `index.ts`, se debe importar desde el barrel usando el alias `@`.

---

## Path Aliases Disponibles

Definidos en `tsconfig.base.json`:

| Alias | Ruta fisica |
|-------|-------------|
| `@apps/auth/*` | `apps/auth/*` |
| `@apps/links/*` | `apps/links/*` |
| `@common/*` | `libs/common/src/*` |
| `@common/test/*` | `libs/common/test/*` |
| `@test/*` | `test/*` |

---

## Orden de Imports

Los imports deben seguir este orden, separados por una linea en blanco entre grupos:

1. **Paquetes externos** (`@nestjs/*`, `typeorm`, `class-transformer`, etc.)
2. **Librerias compartidas** (`@common/*`)
3. **Modulos de la app** (`@apps/*`)
4. **Imports locales** (`./`)

```typescript
// 1. Externos
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

// 2. Compartidos
import { BaseHandler } from '@common/handler';
import { I18nService } from '@common/i18n';
import { ApiResponse } from '@common/responses';

// 3. App
import { CreateLinkCommand } from '@apps/links/src/application/commands';
import { CreateLinkRequest } from '@apps/links/src/application/requests';
import { GetLinkByIdResponse } from '@apps/links/src/application/responses';
import { Link } from '@apps/links/src/domain/entities';
import { type ILinkRepository } from '@apps/links/src/domain/ports';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';
```

---

## Barrel Files (`index.ts`)

Cada carpeta que contenga ficheros `.ts` exportables debe tener un `index.ts` que centralice los exports:

```typescript
// apps/links/src/application/commands/index.ts
export * from './create-link.command';
export * from './delete-link.command';
export * from './update-link.command';
```

### Cuando crear un `index.ts`

- Cuando la carpeta contiene **1 o mas ficheros** exportables
- **NO** crear index.ts en carpetas raiz como `apps/links/src/` (contienen `main.ts`, controllers, module)

### Carpetas que deben tener `index.ts`

```
apps/<service>/src/
    application/
        commands/index.ts
        handlers/index.ts
        queries/index.ts
        requests/index.ts
        responses/index.ts
        services/index.ts
    constants/index.ts
    domain/
        entities/index.ts
        enums/index.ts
        ports/index.ts
        specifications/index.ts
    infrastructure/
        database/index.ts
        repositories/index.ts
```

### Al crear un fichero nuevo

1. Crear el fichero en la carpeta correspondiente
2. Agregar `export * from './<nuevo-fichero>';` al `index.ts` de esa carpeta
3. Importar usando el barrel: `import { NuevaClase } from '@apps/<service>/src/<ruta>';`

---

## Tests

Los ficheros de test siguen las mismas reglas de imports con `@` aliases:

```typescript
// apps/links/test/unit/handlers/create-link-handler/create-link.handler.spec.ts
import { CreateLinkCommand } from '@apps/links/src/application/commands';
import { CreateLinkHandler } from '@apps/links/src/application/handlers';
import { type ILinkRepository } from '@apps/links/src/domain/ports';
import { LinksErrorMessageConstants } from '@apps/links/src/constants';

import { CreateLinkHandlerFixture } from './create-link.handler.fixture';
```

Nota: los fixtures locales (`./`) del mismo directorio de test se importan con ruta relativa.

---

## Resumen Rapido

| Regla | Ejemplo |
|-------|---------|
| Usar aliases `@` | `import { X } from '@apps/links/src/domain/entities'` |
| Nunca `../` | ~~`import { X } from '../../domain/entities/x.entity'`~~ |
| Importar desde barrel | `import { X } from '@apps/links/src/constants'` |
| Nunca fichero individual | ~~`import { X } from '@apps/links/src/constants/x.constants'`~~ |
| Consolidar mismos modulos | `import { A, B } from '@apps/links/src/domain/entities'` |
| `./` solo para hermanos locales | `import { X } from './x.entity'` (dentro del mismo dir) |
