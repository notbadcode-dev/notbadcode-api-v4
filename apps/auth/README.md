
# Auth Microservice

Microservicio de autenticación (`auth`) para la plataforma **NotBadCode API v4**, desarrollado con [NestJS](https://nestjs.com/). Gestiona autenticación basada en JWT, control de sesiones con Redis, integración con MariaDB y soporte completo de internacionalización (i18n). El servicio está preparado para funcionar de manera autónoma y dentro de una arquitectura de microservicios.

---

## Índice

- [Auth Microservice](#auth-microservice)
  - [Índice](#índice)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Variables de entorno](#variables-de-entorno)
  - [Comandos útiles](#comandos-útiles)
  - [Arquitectura y tecnologías](#arquitectura-y-tecnologías)
  - [Buenas prácticas](#buenas-prácticas)
  - [Notas adicionales](#notas-adicionales)

---

## Estructura del proyecto

```text
apps/auth
├── Dockerfile
├── README.md
├── src
│   ├── application
│   │   ├── commands
│   │   ├── dtos
│   │   ├── handlers
│   │   └── value-objects
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── constants
│   ├── domain
│   │   └── entities
│   ├── infrastructure
│   │   ├── database
│   │   └── jwt
│   └── main.ts
├── test
│   ├── unit
│   └── utils
├── tsconfig.build.json
└── tsconfig.json
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del microservicio `auth` basado en el siguiente ejemplo:

```dotenv
# Nombre del microservicio
SERVICE_NAME=auth

# Puerto de escucha
AUTH_PORT=60200

# JWT
AUTH_JWT_SECRET=        # Requerido: Clave secreta segura para firmar JWT
AUTH_JWT_EXPIRES_IN=15m # Ejemplo: 15m, 1h, 7d

# Base de datos específica de Auth
AUTH_DB_NAME=auth_db

# Configuración Redis (sesión y caché)
REDIS_SESSION_URL=redis://:PASSWORD@redis-session-dev:6379/0
REDIS_CACHE_URL=redis://:PASSWORD@redis-cache-dev:6379/0

# SSL (si aplica)
SSL_KEY_PATH=/app/certs/dev-key.pem
SSL_CERT_PATH=/app/certs/dev-cert.pem

# i18n
I18N_DIR=/app/libs/common/src/i18n
FALLBACK_LANGUAGE=en
```

---

## Comandos útiles

- **Arrancar en desarrollo:**
  ```bash
  npm run start:auth:dev
  ```

- **Arrancar en modo debug (puerto 9229):**
  ```bash
  npm run start:auth:debug
  ```

- **Tests unitarios:**
  ```bash
  npm run test:auth
  ```

- **Coverage:**
  ```bash
  npm run test:cov:auth
  ```

- **Build del microservicio:**
  ```bash
  npm run build:auth
  ```

- **Docker Compose (solo auth):**
  ```bash
  npm run docker:up:auth
  ```

---

## Arquitectura y tecnologías

- **NestJS 11**  
  Patrones CQRS y SOLID.
- **JWT y Passport**  
  Login seguro, expiración configurable.
- **Redis**  
  Control de sesiones y caché desacoplado.
- **MariaDB/MySQL**  
  Persistencia de usuarios y credenciales.
- **i18n**  
  Internacionalización basada en ficheros.
- **Swagger**  
  Documentación automática de endpoints (si está habilitado).
- **Testing**  
  Unitarios y mocks avanzados organizados en `test/unit`.

---

## Buenas prácticas

- Nunca subas archivos `.env` ni credenciales al repositorio.
- Revisa y actualiza las dependencias regularmente.
- Asegura que todos los comandos (`npm run ...`) pasan sin errores antes de hacer push.
- Mantén el código formateado (`npm run format`).
- Los tests deben estar siempre actualizados y pasar en CI.

---

## Notas adicionales

- El microservicio `auth` está diseñado para funcionar de forma autónoma, pero integrado dentro de una arquitectura de microservicios.
- Consulta la documentación de arquitectura global en el README raíz del monorepo para ver dependencias cruzadas y configuración compartida.
- Si necesitas añadir endpoints o lógica nueva, sigue las convenciones de CQRS (command/handler) y añade siempre sus tests unitarios.

---

**¿Dudas, sugerencias o bugs?**  
Contacta con el responsable de backend o abre un issue en el repositorio central.
