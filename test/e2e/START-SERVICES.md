# 🚀 Iniciar servicios para tests e2e

## Paso 1: Asegúrate de que Docker esté corriendo

```bash
docker ps
```

Si ves contenedores de MariaDB y Redis, estás listo. Si no:

```bash
docker compose up -d mariadb redis-session redis-cache
```

## Paso 2: Inicia los servicios (en 2 terminales separadas)

### Terminal 1 - Auth Service
```bash
cd /Users/bgr/Proyectos/NestJS/notbadcode-api-v4
npm run start:auth:dev
```

Espera a ver:
```
[Nest] ... LOG [NestApplication] Nest application successfully started
Application is running on: https://localhost:60200
```

### Terminal 2 - Links Service
```bash
cd /Users/bgr/Proyectos/NestJS/notbadcode-api-v4
npm run start:links:dev
```

Espera a ver:
```
[Nest] ... LOG [NestApplication] Nest application successfully started
Application is running on: https://localhost:60201
```

## Paso 3: Ejecuta los tests (en esta terminal o una tercera)

```bash
npm run test:e2e
```

El script verificará automáticamente que ambos servicios estén corriendo antes de ejecutar los tests.

---

**¿Los servicios ya están corriendo?** Ejecuta `npm run test:e2e` directamente.
