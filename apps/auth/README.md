<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="80" alt="NestJS Logo" />
</p>

<h1 align="center">Auth Microservice</h1>

<p align="center">
  Servicio de autenticación y gestión de sesiones para <strong>NotBadCode API v4</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/JWT-Passport-000000?logo=jsonwebtokens" alt="JWT" />
  <img src="https://img.shields.io/badge/MariaDB-11-003545?logo=mariadb" alt="MariaDB" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" />
</p>

---

## Descripción

El microservicio **Auth** gestiona todo el ciclo de autenticación de usuarios: registro, login, logout y renovación de tokens. Implementa **arquitectura hexagonal** con **CQRS**, control de sesiones distribuido con Redis y soporte completo de internacionalización.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Configuración](#configuración)
- [Comandos](#comandos)
- [Seguridad](#seguridad)
- [Testing](#testing)

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                       PRESENTATION                           │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐  │
│  │ AuthController  │    │      AuthHealthController       │  │
│  └────────┬────────┘    └─────────────────────────────────┘  │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │   CommandBus    │  ◄── CQRS Pattern                       │
│  └────────┬────────┘                                         │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│                       APPLICATION                            │
│                                                              │
│  Commands              Handlers                Services      │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐  │
│  │ LoginCommand │────►│ LoginHandler │────►│ AuthService │  │
│  │ RegisterCmd  │     │ RegisterHdlr │     │ HashService │  │
│  │ LogoutCommand│     │ LogoutHandler│     │ UserService │  │
│  │ RefreshCmd   │     │ RefreshHdlr  │     └─────────────┘  │
│  └──────────────┘     └──────┬───────┘                       │
│                              │                               │
│  Value Objects               │     Helpers                   │
│  ┌──────────────┐            │     ┌────────────────────┐   │
│  │  JwtPayload  │◄───────────┼────►│TokenValidationHlpr │   │
│  └──────────────┘            │     └────────────────────┘   │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         DOMAIN                               │
│                                                              │
│  Entities                      Ports (Interfaces)            │
│  ┌──────────────┐             ┌──────────────────────┐      │
│  │    User      │             │   IUserRepository    │      │
│  └──────────────┘             └──────────────────────┘      │
│                                          ▲                   │
└──────────────────────────────────────────┼───────────────────┘
                                           │
                                           │ implements
                                           │
┌──────────────────────────────────────────┼───────────────────┐
│                     INFRASTRUCTURE                           │
│                                           │                  │
│  ┌────────────────────────────────────────┼───────────────┐  │
│  │              TypeOrmUserRepository     ▼               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐  │
│  │ AuthDatabase    │    │        JwtConfigService         │  │
│  │    Module       │    └─────────────────────────────────┘  │
│  └─────────────────┘                                         │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
┌─────────┐     POST /auth/login      ┌─────────────┐
│ Cliente │ ─────────────────────────►│   Auth API  │
└─────────┘                           └──────┬──────┘
                                             │
                 ┌───────────────────────────┼───────────────────────────┐
                 │                           ▼                           │
                 │  1. Validar credenciales (bcrypt)                     │
                 │  2. Generar JwtPayload (Value Object)                 │
                 │  3. Crear tokens (access + refresh)                   │
                 │  4. Guardar sesión en Redis                           │
                 │  5. Actualizar lastLoginAt                            │
                 └───────────────────────────┬───────────────────────────┘
                                             │
┌─────────┐     { accessToken, refreshToken } │
│ Cliente │ ◄─────────────────────────────────┘
└─────────┘
```

---

## Estructura del Proyecto

```
apps/auth/
│
├── src/
│   ├── main.ts                          # Bootstrap de la aplicación
│   ├── auth.module.ts                   # Módulo principal
│   ├── auth.controller.ts               # Controlador REST
│   ├── auth-healtz.controller.ts        # Health check endpoint
│   │
│   ├── application/                     # Capa de aplicación
│   │   ├── commands/                    # Commands CQRS
│   │   │   ├── login.command.ts
│   │   │   ├── logout.command.ts
│   │   │   ├── refresh.command.ts
│   │   │   └── register.command.ts
│   │   │
│   │   ├── handlers/                    # Command Handlers
│   │   │   ├── login.handler.ts
│   │   │   ├── logout.handler.ts
│   │   │   ├── refresh.handler.ts
│   │   │   └── register.handler.ts
│   │   │
│   │   ├── services/                    # Servicios de aplicación
│   │   │   ├── auth.service.ts          # Generación de tokens
│   │   │   ├── hash.service.ts          # Hashing con bcrypt
│   │   │   └── user.service.ts          # Gestión de usuarios
│   │   │
│   │   ├── requests/                    # DTOs de entrada
│   │   ├── responses/                   # DTOs de salida
│   │   ├── value-objects/               # Value Objects
│   │   │   └── jwt-payload.vo.ts        # Payload inmutable
│   │   └── helpers/
│   │       └── token-validation.helper.ts
│   │
│   ├── domain/                          # Capa de dominio
│   │   ├── entities/
│   │   │   └── user.entity.ts           # Entidad User
│   │   └── ports/
│   │       └── user-repository.port.ts  # Interface del repositorio
│   │
│   ├── infrastructure/                  # Capa de infraestructura
│   │   ├── database/
│   │   │   ├── auth-database.module.ts
│   │   │   └── auth-database.config.ts
│   │   ├── repositories/
│   │   │   └── typeorm-user.repository.ts
│   │   └── jwt/
│   │       └── jwt-config.service.ts
│   │
│   └── constants/                       # Constantes del servicio
│       ├── auth.constants.ts
│       ├── auth-error-message.constants.ts
│       └── jwt.constants.ts
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

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/auth/login` | Iniciar sesión | No |
| `POST` | `/auth/logout` | Cerrar sesión | Sí |
| `POST` | `/auth/refresh` | Renovar access token | No |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servicio |

### Ejemplos de Uso

#### Registro

```bash
curl -X POST https://localhost:60200/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "messages": []
}
```

#### Login

```bash
curl -X POST https://localhost:60200/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Refresh Token

```bash
curl -X POST https://localhost:60200/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

---

## Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```dotenv
# ══════════════════════════════════════════════════════════════
# SERVICIO
# ══════════════════════════════════════════════════════════════
AUTH_SERVICE_NAME=auth
AUTH_PORT=60200

# ══════════════════════════════════════════════════════════════
# JWT
# ══════════════════════════════════════════════════════════════
AUTH_JWT_SECRET=your-super-secret-key-min-32-chars
AUTH_JWT_EXPIRES_IN=15m
AUTH_JWT_REFRESH_EXPIRES_IN=7d

# ══════════════════════════════════════════════════════════════
# BASE DE DATOS
# ══════════════════════════════════════════════════════════════
AUTH_DB_HOST=localhost
AUTH_DB_PORT=3306
AUTH_DB_USER=auth_user
AUTH_DB_PASS=auth_password
AUTH_DB_NAME=auth_db

# ══════════════════════════════════════════════════════════════
# REDIS
# ══════════════════════════════════════════════════════════════
REDIS_SESSION_URL=redis://:password@localhost:63792/0
REDIS_CACHE_URL=redis://:password@localhost:63791/0

# ══════════════════════════════════════════════════════════════
# SSL (HTTPS)
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
npm run start:auth:dev

# Iniciar en modo debug (puerto 9229)
npm run start:auth:debug
```

### Build

```bash
npm run build:auth
```

### Docker

```bash
# Solo el servicio auth
npm run docker:up:auth

# Build de la imagen
npm run docker:build:auth
```

### Tests

```bash
# Tests unitarios
npm run test:auth

# Con coverage
npm run test:cov:auth

# Watch mode
npm run test:watch:auth
```

---

## Seguridad

### Características Implementadas

| Característica | Implementación |
|----------------|----------------|
| **Hashing de passwords** | bcrypt con salt rounds configurables |
| **Tokens JWT** | Access token (15m) + Refresh token (7d) |
| **JTI (JWT ID)** | Identificador único por token para revocación |
| **Sesiones distribuidas** | Redis con persistencia |
| **HTTPS** | Certificados SSL configurables |
| **Soft Delete** | Usuarios nunca se eliminan físicamente |

### Estructura del Token

```json
{
  "sub": 1,                                    // User ID
  "email": "user@example.com",
  "jti": "550e8400-e29b-41d4-a716-446655440000", // Unique Token ID
  "tokenType": "access",
  "iat": 1699000000,
  "exp": 1699000900
}
```

---

## Testing

### Estructura de Tests

```
test/
├── unit/
│   ├── handlers/
│   │   ├── login.handler.spec.ts
│   │   ├── register.handler.spec.ts
│   │   └── ...
│   └── services/
│       ├── auth.service.spec.ts
│       └── hash.service.spec.ts
│
└── utils/
    ├── mock-factories.ts
    └── test-helpers.ts
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test:auth

# Con coverage
npm run test:cov:auth

# Watch mode
npm run test:watch:auth
```

---

## Swagger

La documentación interactiva de la API está disponible en:

```
https://localhost:60200/api/docs
```

---

<p align="center">
  <a href="../../../README.md">← Volver al README principal</a>
</p>
