# Common Library (`libs/common`)

Librería común y transversal del monorepo **NotBadCode API v4**.  
Incluye utilidades, módulos, constantes, helpers, middlewares, configuración global,
i18n, logging, interceptores, lógica Redis compartida, y más.  
Sirve como base para todos los microservicios del ecosistema y garantiza **consistencia,
reutilización y calidad** en la arquitectura.

---

## Índice

- [Common Library (`libs/common`)](#common-library-libscommon)
  - [Índice](#índice)
  - [Propósito](#propósito)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Documentación modular](#documentación-modular)
  - [Variables de entorno](#variables-de-entorno)
  - [Comandos útiles](#comandos-útiles)
  - [Contenido principal](#contenido-principal)
  - [Buenas prácticas](#buenas-prácticas)
  - [Notas adicionales](#notas-adicionales)

---

## Propósito

`libs/common` centraliza código reutilizable entre apps y otros paquetes del monorepo.  
Permite evitar duplicidades y facilita la estandarización de utilidades clave (config,
i18n, responses, logs, cache, etc.).

---

## Estructura del proyecto

```text
libs/common
├── src
│   ├── config
│   │   ├── commonConfig.module.ts
│   │   ├── documentation/
│   │   ├── environment/
│   │   ├── helpers/
│   │   └── index.ts
│   ├── constants/
│   ├── database/
│   ├── enums/
│   ├── filters/
│   ├── helpers/
│   ├── i18n/
│   ├── interceptors/
│   ├── loggers/
│   ├── redis/
│   ├── responses/
│   └── value-objects/
├── test
│   ├── jest.config.js
│   └── unit/
├── tsconfig.build.json
└── tsconfig.json
```

---

## Documentación modular

Documentación por subgrupo (estilo índice por capas):

- Entrada de `src`: [`common/src/README.md`](./common/src/README.md)
- Auth compartido: [`common/src/auth/README.md`](./common/src/auth/README.md)
- Configuración transversal: [`common/src/config/README.md`](./common/src/config/README.md)
- Database base: [`common/src/database/README.md`](./common/src/database/README.md)
- Guards: [`common/src/guards/README.md`](./common/src/guards/README.md)
- Handler base CQRS: [`common/src/handler/README.md`](./common/src/handler/README.md)
- i18n: [`common/src/i18n/README.md`](./common/src/i18n/README.md)
- Redis (cache/sesión): [`common/src/redis/README.md`](./common/src/redis/README.md)
- Responses (envelope): [`common/src/responses/README.md`](./common/src/responses/README.md)

Regla:
- Si cambia contrato o comportamiento de un subgrupo, actualizar su `README.md` en la misma PR.

---

## Variables de entorno

Algunos módulos de `libs/common` requieren variables de entorno globales o compartidas,
por ejemplo:

```dotenv
# Internationalization (i18n)
I18N_DIR=/app/libs/common/src/i18n
FALLBACK_LANGUAGE=en

# Configuración de Redis (si se usa módulo de sesiones o caché desde common)
REDIS_SESSION_URL=redis://:PASSWORD@redis-session-dev:6379/0
REDIS_CACHE_URL=redis://:PASSWORD@redis-cache-dev:6379/0

# Otros parámetros globales pueden ser añadidos según las necesidades del monorepo.
```

---

## Comandos útiles

- **Tests unitarios de la librería:**

  ```bash
  npm run test:common
  ```

- **Cobertura de tests:**

  ```bash
  npm run test:cov:common
  ```

- **Formateo de código (aplica a todas las libs/apps):**
  ```bash
  npm run format
  ```

---

## Contenido principal

- **Config y módulos globales** (`commonConfig.module.ts`, `environment/`)
- **Constantes y enums**  
  Mensajes, símbolos, claves y tipos compartidos.
- **Helpers**  
  Utilidades de propósito general y helpers especializados.
- **i18n**  
  Configuración avanzada de internacionalización.
- **Respuestas y DTOs globales**  
  Estructuras de respuesta y servicios para API uniformes.
- **Logging e interceptores**  
  Logger común y decoradores/interceptores para monitorización.
- **Redis**  
  Módulos y servicios para sesiones y cacheo distribuido.
- **Filtros de errores y validaciones**
- **Testing**  
  Ficheros de test unitario y fixtures para facilitar pruebas en los microservicios.

---

## Buenas prácticas

- Nunca modifiques código común solo para un microservicio concreto. Si es muy
  específico, créalo localmente en esa app.
- Toda funcionalidad transversal debe documentarse y acompañarse de tests unitarios.
- Mantén los helpers y constantes lo más desacoplados posible, evitando dependencias
  cíclicas.
- Actualiza la documentación y tests cada vez que añadas o modifiques un módulo global.

---

## Notas adicionales

- Esta librería se importa desde los microservicios mediante paths (`@common/...`).
- Si necesitas ampliar el alcance, consulta antes con el responsable de arquitectura
  para mantener la coherencia global.
- Para cualquier duda o mejora, abre un issue en el repositorio central del monorepo.

---
