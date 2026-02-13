<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<h1 align="center">NotBadCode API v4</h1>

<p align="center">
  <strong>Monorepo de microservicios con arquitectura hexagonal y CQRS</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22.14.0-brightgreen?logo=node.js" alt="Node Version" />
  <img src="https://img.shields.io/badge/npm-%3E%3D10.9.2-red?logo=npm" alt="npm Version" />
  <img src="https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-UNLICENSED-lightgrey" alt="License" />
</p>

---

## Descripcion

**NotBadCode API v4** es un monorepo de microservicios desarrollado con [NestJS](https://nestjs.com/), diseñado siguiendo principios de **Clean Architecture**, **CQRS** y **Domain-Driven Design (DDD)**. Cada microservicio es independiente, escalable y cuenta con su propia base de datos logica.

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Configuracion](#configuracion)
- [Comandos Disponibles](#comandos-disponibles)
- [Docker](#docker)
- [Microservicios](#microservicios)
- [Librerias Compartidas](#librerias-compartidas)
- [Seguridad](#seguridad)
- [Testing](#testing)
- [Contribucion](#contribucion)
- [Documentacion](#documentacion)

---

## Arquitectura

El proyecto implementa una arquitectura robusta basada en multiples patrones:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION                               │
│                    Controllers + Swagger Documentation                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION                                │
│              Commands │ Queries │ Handlers │ Services │ DTOs            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                DOMAIN                                   │
│            Entities │ Value Objects │ Ports │ Specifications            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            INFRASTRUCTURE                               │
│         TypeORM Repositories │ Database Config │ External Services      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Patrones Implementados

| Patron | Descripcion |
|--------|-------------|
| **CQRS** | Separacion de Commands (escritura) y Queries (lectura) |
| **Hexagonal** | Puertos y Adaptadores para inversion de dependencias |
| **Repository** | Abstraccion del acceso a datos mediante interfaces |
| **Value Objects** | Objetos inmutables con validacion en factory methods |
| **Result Pattern** | Manejo de errores sin excepciones (`ErrorOn<T>`) |

---

## Estructura del Proyecto

```
notbadcode-api-v4/
│
├── apps/                          # Microservicios
│   ├── auth/                      # Servicio de autenticacion
│   │   ├── src/
│   │   │   ├── application/       # Casos de uso, commands, handlers
│   │   │   ├── domain/            # Entidades, puertos, reglas de negocio
│   │   │   └── infrastructure/    # Repositorios, configuracion BD
│   │   ├── test/                  # Tests unitarios
│   │   └── Dockerfile
│   │
│   └── links/                     # Servicio de gestion de enlaces
│       ├── src/
│       │   ├── application/       # Commands, queries, handlers
│       │   ├── domain/            # Entidades, especificaciones, puertos
│       │   └── infrastructure/    # Repositorios, base de datos
│       ├── test/
│       └── Dockerfile
│
├── libs/                          # Librerias compartidas
│   └── common/                    # Codigo reutilizable entre microservicios
│       ├── src/
│       │   ├── auth/              # Tipos y guards de autenticacion
│       │   ├── config/            # Configuracion centralizada
│       │   ├── database/          # Entidades base, configuracion TypeORM
│       │   ├── filters/           # Filtros de excepciones
│       │   ├── guards/            # Guards de seguridad
│       │   ├── handlers/          # Handlers base abstractos
│       │   ├── helpers/           # Funciones de utilidad
│       │   ├── i18n/              # Internacionalizacion
│       │   ├── interceptors/      # Interceptores (logging, etc.)
│       │   ├── loggers/           # Configuracion de Winston
│       │   ├── redis/             # Cache y control de sesiones
│       │   ├── responses/         # DTOs de respuesta estandarizados
│       │   └── value-objects/     # Value objects compartidos
│       └── test/
│
├── certs/                         # Certificados SSL para desarrollo
├── docker/                        # Configuraciones adicionales de Docker
├── logs/                          # Logs de la aplicacion (gitignored)
├── test/                          # Tests de integracion globales
│
├── docker-compose.yml             # Orquestacion de servicios
├── docker-compose.override.yml    # Overrides para desarrollo
├── nest-cli.json                  # Configuracion del CLI de NestJS
├── package.json                   # Dependencias y scripts
└── tsconfig.base.json             # Configuracion base de TypeScript
```

---

## Requisitos

Antes de comenzar, asegurate de tener instalado:

| Herramienta | Version Minima | Notas |
|-------------|----------------|-------|
| **Node.js** | `>= 22.14.0` | Recomendado usar [nvm](https://github.com/nvm-sh/nvm) |
| **npm** | `>= 10.9.2` | Incluido con Node.js |
| **Docker** | `>= 24.0` | Para contenedores |
| **Docker Compose** | `>= 2.20` | Orquestacion |

---

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/notbadcode-dev/notbadcode-api-v4.git
cd notbadcode-api-v4

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Generar certificados SSL (desarrollo)
npm run certs:generate
```

---

## Configuracion

### Variables de Entorno Principales

Crea un archivo `.env` en la raiz basandote en `.env.example`:

```dotenv
# ══════════════════════════════════════════════════════════════
# BASE DE DATOS
# ══════════════════════════════════════════════════════════════
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=notbadcode
DB_ROOT_PASSWORD=your_root_password

# ══════════════════════════════════════════════════════════════
# REDIS
# ══════════════════════════════════════════════════════════════
REDIS_CACHE_URL=redis://:password@localhost:63791/0
REDIS_CACHE_PASSWORD=cache_password
REDIS_SESSION_URL=redis://:password@localhost:63792/0
REDIS_SESSION_PASSWORD=session_password

# ══════════════════════════════════════════════════════════════
# SSL
# ══════════════════════════════════════════════════════════════
SSL_KEY_PATH=./certs/dev-key.pem
SSL_CERT_PATH=./certs/dev-cert.pem
```

> Cada microservicio puede tener su propio `.env` en `apps/<service>/.env`

---

## Comandos Disponibles

### Desarrollo

```bash
# Iniciar microservicios en modo desarrollo
npm run start:auth:dev          # Auth con hot-reload
npm run start:links:dev         # Links con hot-reload

# Modo debug (con breakpoints)
npm run start:auth:debug        # Puerto 9229
npm run start:links:debug       # Puerto 9230
```

### Build

```bash
npm run build                   # Build de todos los proyectos
npm run build:auth              # Build solo de auth
npm run build:links             # Build solo de links
npm run build:clean             # Limpia dist/ y rebuilds
```

### Testing

```bash
npm test                        # Todos los tests
npm run test:auth               # Tests de auth
npm run test:links              # Tests de links
npm run test:common             # Tests de common

npm run test:cov                # Coverage global
npm run test:cov:auth           # Coverage de auth

npm run test:watch              # Watch mode
```

### Calidad de Codigo

```bash
npm run lint                    # Ejecutar ESLint
npm run lint:fix                # Corregir errores automaticamente
npm run format                  # Formatear con Prettier
npm run format:check            # Verificar formato
```

---

## Docker

### Infraestructura

El proyecto incluye una infraestructura completa con Docker:

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| **MariaDB** | `3306` | Base de datos principal |
| **Redis Cache** | `63791` | Cache LRU (512MB) |
| **Redis Session** | `63792` | Sesiones persistentes (256MB) |
| **Auth** | `60200` | Microservicio de autenticacion |
| **Links** | `60201` | Microservicio de enlaces |

### Comandos Docker

```bash
# ─────────────────────────────────────────────
# Perfiles disponibles: prod, debug
# ─────────────────────────────────────────────

# Levantar infraestructura completa (produccion)
npm run docker:up:prod

# Levantar en modo debug
npm run docker:up:debug

# Comandos individuales
npm run docker:up:auth          # Solo auth
npm run docker:up:links         # Solo links

# Gestion
npm run docker:ps               # Ver estado
npm run docker:logs             # Ver logs (tail -f)
npm run docker:down             # Detener todo
npm run docker:prune            # Limpiar recursos
```

---

## Microservicios

### Auth Service

Gestiona autenticacion y autorizacion de usuarios.

| Caracteristica | Tecnologia |
|----------------|------------|
| Autenticacion | JWT + Passport |
| Sesiones | Redis (persistente) |
| Passwords | bcrypt |
| Base de datos | MariaDB |

**Endpoints principales:**
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesion
- `POST /auth/logout` - Cierre de sesion
- `POST /auth/refresh` - Renovar tokens

[Documentacion completa](./apps/auth/README.md)

---

### Links Service

Gestiona enlaces y colecciones de usuarios.

| Caracteristica | Tecnologia |
|----------------|------------|
| CQRS completo | Commands + Queries |
| Especificaciones | Domain Specifications |
| Cache | Redis LRU |

[Documentacion completa](./apps/links/README.md)

---

## Librerias Compartidas

### Common Library

Codigo reutilizable entre microservicios:

- **Entidades base**: `AuditableEntity`, `DeletableEntity`
- **Handlers abstractos**: `BaseHandler`, `BasePaginatesHandler`
- **Respuestas estandarizadas**: `ApiResponse`, `ApiSuccessResponse`, `ApiFailureResponse`
- **Configuracion**: Modulos de config, Redis, logging
- **Internacionalizacion**: Soporte multi-idioma con i18n
- **Guards y Filtros**: Autenticacion JWT, validacion

[Documentacion completa](./libs/common/README.md)

---

## Seguridad

### CSRF Protection

El proyecto incluye proteccion CSRF para todas las peticiones mutantes (POST, PUT, DELETE).

**Implementacion:**

1. El `AuthService` genera un token CSRF y lo almacena en la sesion del usuario durante el login
2. El `LoginResponse` incluye el token CSRF en la respuesta
3. El `JwtAuthGuard` extrae el token CSRF del payload JWT y lo almacena en `UserSession`
4. El `JwtAuthGuard` verifica que el token CSRF en los headers coincida con el de la sesion

**Uso:**

Los desarrolladores deben incluir el token CSRF proporcionado en el login en el header `X-CSRF-Token` para todas las peticiones mutantes.

Las peticiones sin un token CSRF valido seran rechazadas con una respuesta 401 Unauthorized.

### Otras Caracteristicas de Seguridad

| Caracteristica | Descripcion |
|----------------|-------------|
| **JWT** | Tokens de acceso (15m) + refresh (7d) |
| **bcrypt** | Hashing de passwords con salt configurable |
| **HTTPS** | Certificados SSL para desarrollo y produccion |
| **Sesiones Redis** | Control de sesiones distribuido |

---

## Testing

El proyecto sigue una estrategia de testing por capas:

```bash
test/
├── unit/                  # Tests unitarios (handlers, services)
└── utils/                 # Helpers y mocks para tests
```

### Convenciones

- Archivos de test: `*.spec.ts`
- Mocks con `jest-mock-extended`
- Coverage minimo recomendado: 80%

---

## Contribucion

### Flujo de Trabajo

1. Crear rama desde `main`: `git checkout -b feature/nombre-feature`
2. Desarrollar siguiendo las convenciones del proyecto
3. Asegurar que pasen lint y tests: `npm run lint && npm test`
4. Crear Pull Request con descripcion detallada

### Convenciones de Codigo

- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Naming**: camelCase para variables, PascalCase para clases
- **Arquitectura**: Respetar la separacion de capas

### Antes de hacer Push

```bash
npm run lint:fix && npm run format && npm test
```

---

## Documentacion

| Recurso | Enlace |
|---------|--------|
| Auth Service | [apps/auth/README.md](./apps/auth/README.md) |
| Links Service | [apps/links/README.md](./apps/links/README.md) |
| Common Library | [libs/common/README.md](./libs/common/README.md) |
| Swagger (Auth) | `https://localhost:60200/api/docs` |
| Swagger (Links) | `https://localhost:60201/api/docs` |

---

<p align="center">
  <sub>Desarrollado con mass por el equipo de NotBadCode</sub>
</p>
