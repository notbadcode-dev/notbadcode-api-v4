<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="80" alt="NestJS Logo" />
</p>

<h1 align="center">Links Microservice</h1>

<p align="center">
  Servicio de gestión de enlaces y colecciones para <strong>NotBadCode API v4</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/CQRS-Commands%20%2B%20Queries-blueviolet" alt="CQRS" />
  <img src="https://img.shields.io/badge/MariaDB-11-003545?logo=mariadb" alt="MariaDB" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" />
</p>

---

## Descripción

El microservicio **Links** gestiona la creación, organización y consulta de enlaces de usuarios. Implementa **CQRS completo** (Commands + Queries), **Domain Specifications** para filtrado avanzado y **arquitectura hexagonal** con inversión de dependencias.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características](#características)
- [Configuración](#configuración)
- [Comandos](#comandos)
- [Testing](#testing)

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                       PRESENTATION                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   LinksController                        │ │
│  └──────────────────────────┬──────────────────────────────┘ │
│                             │                                │
│              ┌──────────────┴──────────────┐                 │
│              ▼                             ▼                 │
│     ┌─────────────────┐          ┌─────────────────┐        │
│     │   CommandBus    │          │    QueryBus     │        │
│     └────────┬────────┘          └────────┬────────┘        │
└──────────────┼─────────────────────────────┼─────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────────────────────────────────────────┐
│                       APPLICATION                            │
│                                                              │
│  Commands                              Queries               │
│  ┌───────────────────┐                ┌───────────────────┐ │
│  │ CreateLinkCommand │                │ GetLinksQuery     │ │
│  │ UpdateLinkCommand │                │ GetLinkByIdQuery  │ │
│  │ DeleteLinkCommand │                │ SearchLinksQuery  │ │
│  └─────────┬─────────┘                └─────────┬─────────┘ │
│            │                                    │            │
│            ▼                                    ▼            │
│  ┌───────────────────┐                ┌───────────────────┐ │
│  │  Command Handlers │                │  Query Handlers   │ │
│  └─────────┬─────────┘                └─────────┬─────────┘ │
│            │                                    │            │
│            └────────────────┬───────────────────┘            │
│                             │                                │
│                             ▼                                │
│                    ┌─────────────────┐                       │
│                    │    Services     │                       │
│                    └─────────────────┘                       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         DOMAIN                               │
│                                                              │
│  Entities              Specifications          Ports         │
│  ┌────────────┐       ┌────────────────┐     ┌────────────┐ │
│  │   Link     │       │ ActiveLinksSpec│     │ILinkRepo   │ │
│  │   Group    │       │ ByUserSpec     │     │IGroupRepo  │ │
│  │   Tag      │       │ ByTagSpec      │     └─────┬──────┘ │
│  └────────────┘       └────────────────┘           │        │
│                                                     │        │
│  Enums                                             │        │
│  ┌────────────────────────────────────┐            │        │
│  │ LinkStatus │ LinkVisibility │ ...  │            │        │
│  └────────────────────────────────────┘            │        │
└────────────────────────────────────────────────────┼────────┘
                                                     │
                                                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              TypeORM Repositories                        │ │
│  │  ┌─────────────────┐    ┌─────────────────┐             │ │
│  │  │TypeOrmLinkRepo  │    │TypeOrmGroupRepo │             │ │
│  │  └─────────────────┘    └─────────────────┘             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Database Configuration                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
apps/links/
│
├── src/
│   ├── main.ts                          # Bootstrap de la aplicación
│   ├── links.module.ts                  # Módulo principal
│   ├── links.controller.ts              # Controlador REST
│   │
│   ├── application/                     # Capa de aplicación
│   │   ├── commands/                    # Commands CQRS (escritura)
│   │   │   ├── create-link.command.ts
│   │   │   ├── update-link.command.ts
│   │   │   └── delete-link.command.ts
│   │   │
│   │   ├── queries/                     # Queries CQRS (lectura)
│   │   │   ├── get-links.query.ts
│   │   │   ├── get-link-by-id.query.ts
│   │   │   └── search-links.query.ts
│   │   │
│   │   ├── handlers/                    # Command & Query Handlers
│   │   │   ├── create-link.handler.ts
│   │   │   ├── get-links.handler.ts
│   │   │   └── ...
│   │   │
│   │   ├── services/                    # Servicios de aplicación
│   │   ├── requests/                    # DTOs de entrada
│   │   └── responses/                   # DTOs de salida
│   │
│   ├── domain/                          # Capa de dominio
│   │   ├── entities/                    # Entidades del dominio
│   │   │   ├── link.entity.ts
│   │   │   ├── group.entity.ts
│   │   │   └── tag.entity.ts
│   │   │
│   │   ├── ports/                       # Interfaces (Puertos)
│   │   │   ├── link-repository.port.ts
│   │   │   └── group-repository.port.ts
│   │   │
│   │   ├── specifications/              # Domain Specifications
│   │   │   ├── active-links.spec.ts
│   │   │   ├── by-user.spec.ts
│   │   │   └── by-tag.spec.ts
│   │   │
│   │   └── enums/                       # Enumeraciones del dominio
│   │       ├── link-status.enum.ts
│   │       └── link-visibility.enum.ts
│   │
│   ├── infrastructure/                  # Capa de infraestructura
│   │   ├── database/
│   │   │   ├── links-database.module.ts
│   │   │   └── links-database.config.ts
│   │   │
│   │   └── repositories/                # Implementaciones TypeORM
│   │       ├── typeorm-link.repository.ts
│   │       └── typeorm-group.repository.ts
│   │
│   └── constants/                       # Constantes del servicio
│
├── test/
│   ├── unit/                            # Tests unitarios
│   └── utils/                           # Utilidades para tests
│
├── Dockerfile
├── .env.example
├── tsconfig.build.json
└── tsconfig.json
```

---

## Características

### CQRS Completo

A diferencia del servicio Auth (solo Commands), Links implementa **CQRS completo**:

| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| **Commands** | Operaciones de escritura | `CreateLinkCommand`, `UpdateLinkCommand` |
| **Queries** | Operaciones de lectura | `GetLinksQuery`, `SearchLinksQuery` |

### Domain Specifications

Patrones de especificación para filtrado reutilizable:

```typescript
// Ejemplo conceptual
const activeUserLinks = new AndSpecification(
  new ActiveLinksSpecification(),
  new ByUserSpecification(userId)
);

const links = await repository.findBySpecification(activeUserLinks);
```

### Inversión de Dependencias

Los handlers dependen de **interfaces (puertos)**, no de implementaciones:

```
Domain Layer:    ILinkRepository (interface)
                        ▲
                        │ implements
                        │
Infra Layer:     TypeOrmLinkRepository (class)
```

---

## Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```dotenv
# ══════════════════════════════════════════════════════════════
# SERVICIO
# ══════════════════════════════════════════════════════════════
LINKS_SERVICE_NAME=links
LINKS_PORT=60201

# ══════════════════════════════════════════════════════════════
# BASE DE DATOS
# ══════════════════════════════════════════════════════════════
LINKS_DB_HOST=localhost
LINKS_DB_PORT=3306
LINKS_DB_USER=links_user
LINKS_DB_PASS=links_password
LINKS_DB_NAME=links_db

# ══════════════════════════════════════════════════════════════
# REDIS
# ══════════════════════════════════════════════════════════════
REDIS_CACHE_URL=redis://:password@localhost:63791/0
REDIS_SESSION_URL=redis://:password@localhost:63792/0

# ══════════════════════════════════════════════════════════════
# SSL
# ══════════════════════════════════════════════════════════════
SSL_KEY_PATH=./certs/dev-key.pem
SSL_CERT_PATH=./certs/dev-cert.pem

# ══════════════════════════════════════════════════════════════
# INTERNACIONALIZACIÓN
# ══════════════════════════════════════════════════════════════
I18N_DIR=/app/libs/common/src/i18n
FALLBACK_LANGUAGE=en
```

---

## Comandos

### Desarrollo

```bash
# Iniciar con hot-reload
npm run start:links:dev

# Iniciar en modo debug (puerto 9230)
npm run start:links:debug
```

### Build

```bash
npm run build:links
```

### Docker

```bash
# Solo el servicio links
npm run docker:up:links

# Build de la imagen
npm run docker:build:links
```

### Tests

```bash
# Tests unitarios
npm run test:links

# Con coverage
npm run test:cov:links

# Watch mode
npm run test:watch:links
```

---

## Testing

### Estructura de Tests

```
test/
├── unit/
│   ├── handlers/
│   │   ├── create-link.handler.spec.ts
│   │   ├── get-links.handler.spec.ts
│   │   └── ...
│   ├── services/
│   └── specifications/
│       └── active-links.spec.spec.ts
│
└── utils/
    ├── mock-factories.ts
    └── test-helpers.ts
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test:links

# Con coverage
npm run test:cov:links

# Watch mode
npm run test:watch:links
```

---

## Swagger

La documentación interactiva de la API está disponible en:

```
https://localhost:60201/api/docs
```

---

<p align="center">
  <a href="../../../README.md">← Volver al README principal</a>
</p>
