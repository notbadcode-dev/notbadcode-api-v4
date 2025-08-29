
# NotBadCode API v4 — Monorepo

Monorepo de microservicios para la plataforma **NotBadCode API v4**, desarrollado con [NestJS](https://nestjs.com/), siguiendo arquitectura modular y escalable. Incluye microservicios independientes, librerías compartidas, infraestructura Docker, scripts y utilidades de desarrollo.

---

## Índice

- [NotBadCode API v4 — Monorepo](#notbadcode-api-v4--monorepo)
  - [Índice](#índice)
  - [Estructura del repositorio](#estructura-del-repositorio)
  - [Primeros pasos](#primeros-pasos)
  - [Variables de entorno](#variables-de-entorno)
  - [Comandos útiles](#comandos-útiles)
  - [Estandarización y buenas prácticas](#estandarización-y-buenas-prácticas)
  - [Documentación específica](#documentación-específica)
  - [Notas](#notas)

---

## Estructura del repositorio

```text
.
├── Dockerfile.base
├── README.md
├── apps/
│   └── auth/
│       ├── Dockerfile
│       ├── README.md
│       └── src/
├── certs/
├── db/
├── docker/
├── docker-compose.yml
├── docker-compose.override.yml
├── jest.config.js
├── libs/
│   └── common/
│       ├── src/
│       ├── test/
│       └── README.md
├── logs/
├── test/
├── tsconfig.base.json
└── package.json
```

---

## Primeros pasos

1. **Clona el repositorio**  
   ```bash
   git clone <REPO_URL>
   cd notbadcode-api-v4
   ```

2. **Instala dependencias**  
   ```bash
   npm install
   ```

3. **Copia y configura los archivos de entorno**  
   - Renombra `.env.example` a `.env` en cada microservicio o raíz, y ajusta variables.

4. **Lanza la infraestructura Docker**  
   ```bash
   npm run docker:up
   ```

5. **Arranca un microservicio en desarrollo**  
   ```bash
   npm run start:auth:dev
   ```

---

## Variables de entorno

- Los ejemplos de configuración se encuentran en cada microservicio y en la carpeta raíz.
- Ajusta las variables relacionadas con Redis, MariaDB, JWT, puertos, i18n, etc. según tu entorno.

---

## Comandos útiles

- **Build global:**  
  ```bash
  npm run build
  ```

- **Build individual (ej: auth):**  
  ```bash
  npm run build:auth
  ```

- **Tests globales:**  
  ```bash
  npm test
  ```

- **Coverage:**  
  ```bash
  npm run test:cov
  ```

- **Formateo:**  
  ```bash
  npm run format
  ```

- **Levantar todo con Docker Compose:**  
  ```bash
  npm run docker:up
  ```

---

## Estandarización y buenas prácticas

- Todo código compartido debe ir en `libs/common`.
- Sigue las convenciones de nombres y carpetas descritas en este README y en los de cada microservicio/lib.
- No subas nunca `.env` ni archivos sensibles.
- Es obligatorio pasar lint y tests antes de hacer push.
- Revisa el README específico de cada microservicio o librería para instrucciones particulares.

---

## Documentación específica

- [Documentación del microservicio Auth](apps/auth/README.md)
- [Documentación de la librería Common](libs/common/README.md)

---

## Notas

- Esta estructura está preparada para escalar, incorporar nuevos microservicios y compartir lógica de forma segura.
- Si necesitas añadir nuevas apps, libs, comandos o ajustar la configuración global, actualiza también este README.
- Para dudas, contacta con el responsable técnico o abre un issue en el repositorio.

---
