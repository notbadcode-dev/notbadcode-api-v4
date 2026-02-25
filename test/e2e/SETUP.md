# Setup para tests e2e

## 🚨 Requisitos previos

### 1. Servicios corriendo

#### Opción A: Docker (Recomendado)
```bash
# Levantar servicios
npm run docker:up

# Verificar que estén corriendo
npm run docker:ps
```

#### Opción B: Local
- MariaDB en `localhost:3306`
- Redis en `localhost:6379`

### 2. Crear bases de datos de test

Conectarse a MariaDB y ejecutar:
```sql
CREATE DATABASE IF NOT EXISTS auth_db_test;
CREATE DATABASE IF NOT EXISTS links_db_test;
```

**Via Docker:**
```bash
docker exec -it mariadb mysql -uroot -p6900 -e "CREATE DATABASE IF NOT EXISTS auth_db_test; CREATE DATABASE IF NOT EXISTS links_db_test;"
```

**Via local:**
```bash
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS auth_db_test; CREATE DATABASE IF NOT EXISTS links_db_test;"
```

### 3. Configurar variables de entorno

El archivo `.env.test` ya está creado con:
- Rutas locales (no Docker)
- Bases de datos `*_test`
- Redis en DB 2 y 3 (para no conflictar con dev)

## 🧪 Ejecutar tests

### Verificar servicios primero
```bash
# Verificar MariaDB
docker ps | grep mariadb

# Verificar Redis
docker ps | grep redis
```

### Ejecutar tests
```bash
# Cargar variables de entorno de test
export $(cat .env.test | xargs)

# Ejecutar todos los tests e2e
npm run test:e2e

# O tests específicos
npm run test:e2e:auth
npm run test:e2e:links
npm run test:e2e:group-links
```

## 🔍 Troubleshooting

### Error: Cannot connect to database
```bash
# 1. Verificar que MariaDB esté corriendo
docker ps | grep mariadb

# 2. Verificar credenciales
docker exec -it mariadb mysql -uroot -p6900 -e "SELECT 1;"

# 3. Verificar bases de datos
docker exec -it mariadb mysql -uroot -p6900 -e "SHOW DATABASES;"
```

### Error: I18n path not found
```bash
# Verificar que el directorio exista
ls -la ./libs/common/src/i18n/

# El .env.test debe usar ruta relativa (./libs...) no absoluta (/app/...)
cat .env.test | grep I18N_DIR
```

### Error: Redis connection
```bash
# Verificar que Redis esté corriendo
docker ps | grep redis

# Test de conexión
redis-cli -h localhost -p 6379 ping
```

### Limpiar datos de test
```bash
# Limpiar bases de datos
docker exec -it mariadb mysql -uroot -p6900 -e "DROP DATABASE IF EXISTS auth_db_test; DROP DATABASE IF EXISTS links_db_test; CREATE DATABASE auth_db_test; CREATE DATABASE links_db_test;"

# Limpiar Redis test DBs
redis-cli -h localhost -p 6379 -n 2 FLUSHDB
redis-cli -h localhost -p 6379 -n 3 FLUSHDB
```

## 📋 Checklist pre-ejecución

- [ ] Docker corriendo (`docker ps`)
- [ ] MariaDB accesible (`docker exec -it mariadb mysql -uroot -p6900 -e "SELECT 1;"`)
- [ ] Redis accesible (`redis-cli ping`)
- [ ] Bases de datos `*_test` creadas
- [ ] Variables de entorno cargadas (`export $(cat .env.test | xargs)`)
- [ ] Directorio i18n existe (`ls ./libs/common/src/i18n/`)

## 🎯 Quick Start

```bash
# 1. Levantar servicios
npm run docker:up

# 2. Crear bases de datos
docker exec -it mariadb mysql -uroot -p6900 -e "CREATE DATABASE IF NOT EXISTS auth_db_test; CREATE DATABASE IF NOT EXISTS links_db_test;"

# 3. Cargar env de test
export $(cat .env.test | xargs)

# 4. Ejecutar tests
npm run test:e2e
```
