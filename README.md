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

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Descripción

**NotBadCode API v4** es un monorepo de microservicios desarrollado con [NestJS](https://nestjs.com/), diseñado siguiendo principios de **Clean Architecture**, **CQRS** y **Domain-Driven Design (DDD)**. Cada microservicio es independiente, escalable y cuenta con su propia base de datos lógica.

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Comandos Disponibles](#comandos-disponibles)
- [Docker](#docker)
- [Microservicios](#microservicios)
- [Librerías Compartidas](#librerías-compartidas)
- [Testing](#testing)
- [Contribución](#contribución)
- [Documentación](#documentación)

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Arquitectura

El proyecto implementa una arquitectura robusta basada en múltiples patrones:

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

| Patrón | Descripción |
|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

-----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|
| **CQRS** | Separación de Commands (escritura) y Queries (lectura) |
| **Hexagonal** | Puertos y Adaptadores para inversión de dependencias |
| **Repository** | Abstracción del acceso a datos mediante interfaces |
| **Value Objects** | Objetos inmutables con validación en factory methods |
| **Result Pattern** | Manejo de errores sin excepciones (`ErrorOn<T>`) |

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Estructura del Proyecto

```
notbadcode-api-v4/
│
├── apps/                          # Microservicios
│   ├── auth/                      # Servicio de autenticación
│   │   ├── src/
│   │   │   ├── application/       # Casos de uso, commands, handlers
│   │   │   ├── domain/            # Entidades, puertos, reglas de negocio
│   │   │   └── infrastructure/    # Repositorios, configuración BD
│   │   ├── test/                  # Tests unitarios
│   │   └── Dockerfile
│   │
│   └── links/                     # Servicio de gestión de enlaces
│       ├── src/
│       │   ├── application/       # Commands, queries, handlers
│       │   ├── domain/            # Entidades, especificaciones, puertos
│       │   └── infrastructure/    # Repositorios, base de datos
│       ├── test/
│       └── Dockerfile
│
├── libs/                          # Librerías compartidas
│   └── common/                    # Código reutilizable entre microservicios
│       ├── src/
│       │   ├── auth/              # Tipos y guards de autenticación
│       │   ├── config/            # Configuración centralizada
│       │   ├── database/          # Entidades base, configuración TypeORM
│       │   ├── filters/           # Filtros de excepciones
│       │   ├── guards/            # Guards de seguridad
│       │   ├── handlers/          # Handlers base abstractos
│       │   ├── helpers/           # Funciones de utilidad
│       │   ├── i18n/              # Internacionalización
│       │   ├── interceptors/      # Interceptores (logging, etc.)
│       │   ├── loggers/           # Configuración de Winston
│       │   ├── redis/             # Cache y control de sesiones
│       │   ├── responses/         # DTOs de respuesta estandarizados
│       │   └── value-objects/     # Value objects compartidos
│       └── test/
│
├── certs/                         # Certificados SSL para desarrollo
├── docker/                        # Configuraciones adicionales de Docker
├── logs/                          # Logs de la aplicación (gitignored)
├── test/                          # Tests de integración globales
│
├── docker-compose.yml             # Orquestación de servicios
├── docker-compose.override.yml    # Overrides para desarrollo
├── nest-cli.json                  # Configuración del CLI de NestJS
├── package.json                   # Dependencias y scripts
└── tsconfig.base.json             # Configuración base de TypeScript
```

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Requisitos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Notas |
|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|
| **Node.js** | `>= 22.14.0` | Recomendado usar [nvm](https://github.com/nvm-sh/nvm) |
| **npm** | `>= 10.9.2` | Incluido con Node.js |
| **Docker** | `>= 24.0` | Para contenedores |
| **Docker Compose** | `>= 2.20` | Orquestación |

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Instalación

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

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Configuración

### Variables de Entorno Principales

Crea un archivo `.env` en la raíz basándote en `.env.example`:

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

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

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

### Calidad de Código

```bash
npm run lint                    # Ejecutar ESLint
npm run lint:fix                # Corregir errores automáticamente
npm run format                  # Formatear con Prettier
npm run format:check            # Verificar formato
```

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Docker

### Infraestructura

El proyecto incluye una infraestructura completa con Docker:

| Servicio | Puerto | Descripción |
|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

-----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|
| **MariaDB** | `3306` | Base de datos principal |
| **Redis Cache** | `63791` | Caché LRU (512MB) |
| **Redis Session** | `63792` | Sesiones persistentes (256MB) |
| **Auth** | `60200` | Microservicio de autenticación |
| **Links** | `60201` | Microservicio de enlaces |

### Comandos Docker

```bash
# ─────────────────────────────────────────────
# Perfiles disponibles: prod, debug
# ─────────────────────────────────────────────

# Levantar infraestructura completa (producción)
npm run docker:up:prod

# Levantar en modo debug
npm run docker:up:debug

# Comandos individuales
npm run docker:up:auth          # Solo auth
npm run docker:up:links         # Solo links

# Gestión
npm run docker:ps               # Ver estado
npm run docker:logs             # Ver logs (tail -f)
npm run docker:down             # Detener todo
npm run docker:prune            # Limpiar recursos
```

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Microservicios

### Auth Service

Gestiona autenticación y autorización de usuarios.

| Característica | Tecnología |
|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---|
| Autenticación | JWT + Passport |
| Sesiones | Redis (persistente) |
| Passwords | bcrypt |
| Base de datos | MariaDB |

**Endpoints principales:**
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cierre de sesión
- `POST /auth/refresh` - Renovar tokens

📖 [Documentación completa](./apps/auth/README.md)

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

### Links Service

Gestiona enlaces y colecciones de usuarios.

| Característica | Tecnología |
|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

----|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---|
| CQRS completo | Commands + Queries |
| Especificaciones | Domain Specifications |
| Cache | Redis LRU |

📖 [Documentación completa](./apps/links/README.md)

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Librerías Compartidas

### Common Library

Código reutilizable entre microservicios:

- **Entidades base**: `AuditableEntity`, `DeletableEntity`
- **Handlers abstractos**: `BaseHandler`, `BasePaginatesHandler`
- **Respuestas estandarizadas**: `ApiResponse`, `ApiSuccessResponse`, `ApiFailureResponse`
- **Configuración**: Módulos de config, Redis, logging
- **Internacionalización**: Soporte multi-idioma con i18n
- **Guards y Filtros**: Autenticación JWT, validación

📖 [Documentación completa](./libs/common/README.md)

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

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
- Coverage mínimo recomendado: 80%

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Contribución

### Flujo de Trabajo

1. Crear rama desde `main`: `git checkout -b feature/nombre-feature`
2. Desarrollar siguiendo las convenciones del proyecto
3. Asegurar que pasen lint y tests: `npm run lint && npm test`
4. Crear Pull Request con descripción detallada

### Convenciones de Código

- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Naming**: camelCase para variables, PascalCase para clases
- **Arquitectura**: Respetar la separación de capas

### Antes de hacer Push

```bash
npm run lint:fix && npm run format && npm test
```

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

## Documentación

| Recurso | Enlace |
|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---|## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

-----|
| Auth Service | [apps/auth/README.md](./apps/auth/README.md) |
| Links Service | [apps/links/README.md](./apps/links/README.md) |
| Common Library | [libs/common/README.md](./libs/common/README.md) |
| Swagger (Auth) | `https://localhost:60200/api/docs` |
| Swagger (Links) | `https://localhost:60201/api/docs` |

## CSRF Protection

This project has been updated to include CSRF protection for all mutating (POST, PUT, DELETE) requests.

The key changes are:

1. The `AuthService` now generates a CSRF token and stores it in the user's session when they log in.
2. The `LoginResponse` returned from the `AuthController` includes the CSRF token.
3. The `JwtAuthGuard` has been updated to extract the CSRF token from the JWT payload and store it in the `UserSession` object.
4. The `JwtAuthGuard` now verifies that the CSRF token in the request headers matches the one stored in the user's session.

Requests without a valid CSRF token will be rejected with a 401 Unauthorized response.

Unit tests have been added to the `AuthController` to ensure the CSRF protection is working as expected.

Developers should use the CSRF token provided in the login response and include it in the `X-CSRF-Token` header for all mutating requests.

---

<p align="center">
  <sub>Desarrollado con ❤️ por el equipo de NotBadCode</sub>
</p>
