# E2E Tests

Tests de integración end-to-end para la API de notbadcode-api-v4.

## 📋 Estructura

```
test/e2e/
├── auth/                      # Tests de autenticación
│   └── auth.e2e-spec.ts
├── links/                     # Tests de links CRUD
│   └── links-crud.e2e-spec.ts
├── group-links/               # Tests de group links CRUD
│   └── group-links-crud.e2e-spec.ts
├── utils/                     # Helpers y utilidades
│   ├── auth.helper.ts
│   ├── links.helper.ts
│   ├── group-links.helper.ts
│   └── test-app.ts
├── jest-e2e.config.js         # Configuración Jest para e2e
├── setup.ts                   # Setup global de tests
└── README.md                  # Esta documentación
```

## 🚀 Requisitos previos

1. **Base de datos de test:**
   - MariaDB corriendo en `localhost:3306` o configurado en variables de entorno
   - Bases de datos `auth_db_test` y `links_db_test` creadas
   - Usuario con permisos de escritura

2. **Redis:**
   - Redis para sesiones
   - Redis para caché

3. **Variables de entorno:**
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   AUTH_DB_NAME=auth_db_test
   LINKS_DB_NAME=links_db_test
   REDIS_SESSION_URL=redis://localhost:6379/0
   REDIS_CACHE_URL=redis://localhost:6379/1
   ```

## 🧪 Ejecutar tests

### Todos los tests e2e
```bash
npm run test:e2e
```

### Tests por módulo
```bash
npm run test:e2e:auth         # Solo Auth
npm run test:e2e:links        # Solo Links
npm run test:e2e:group-links  # Solo Group Links
```

### Test específico
```bash
npm run test:e2e -- --testNamePattern="should register"
```

## 📊 Fase 1 - Tests implementados

### Auth API (21 tests)
- ✅ POST /auth/register (6 tests)
  - Happy path con credenciales válidas
  - Email inválido (400)
  - Password débil (400)
  - Request body vacío (400)
  - Email duplicado (409)

- ✅ POST /auth/login (5 tests)
  - Happy path con credenciales correctas
  - Credenciales incorrectas (401)
  - Usuario no existe (401)
  - Email inválido (400)
  - Request body vacío (400)

- ✅ POST /auth/logout (4 tests)
  - Happy path con token válido
  - Sin Authorization header (401)
  - Token inválido (401)
  - Token ya usado (401)

- ✅ POST /auth/refresh (3 tests)
  - Happy path con refresh token válido
  - Refresh token inválido (401)
  - Request body vacío (400)

- ✅ Flujo completo (1 test)
  - Register → Login → Logout

### Links API (22 tests)
- ✅ POST /links (6 tests)
  - Happy path con datos mínimos
  - Happy path con todos los campos
  - Sin autenticación (401)
  - URL inválida (400)
  - Title vacío (400)
  - Type inválido (400)

- ✅ GET /links/:id (4 tests)
  - Happy path obtiene link existente
  - Sin autenticación (401)
  - Link no existe (404)
  - ID no numérico (400)

- ✅ PATCH /links/:id (6 tests)
  - Update título
  - Update múltiples campos
  - Sin autenticación (401)
  - Link no existe (404)
  - URL inválida (400)
  - Payload vacío (400)

- ✅ DELETE /links/:id (4 tests)
  - Happy path elimina link
  - Verifica soft delete (404 después)
  - Sin autenticación (401)
  - Link no existe (404)

- ✅ Flujo completo (1 test)
  - Create → Get → Update → Delete

### Group Links API (25 tests)
- ✅ POST /group-links (7 tests)
  - Happy path con datos mínimos
  - Happy path con todos los campos
  - Happy path con parent válido
  - Sin autenticación (401)
  - Title vacío (400)
  - Color RGB inválido (400)
  - Parent no existe (404)

- ✅ GET /group-links/:id (4 tests)
  - Happy path obtiene grupo existente
  - Sin autenticación (401)
  - Grupo no existe (404)
  - ID no numérico (400)

- ✅ PATCH /group-links/:id (9 tests)
  - Update título
  - Update parent
  - Update color e icon
  - Remover parent (null)
  - Sin autenticación (401)
  - Grupo no existe (404)
  - Payload vacío (400)
  - Self as parent (400)
  - Ciclo detectado (409)

- ✅ DELETE /group-links/:id (4 tests)
  - Happy path elimina grupo
  - Verifica soft delete (404 después)
  - Sin autenticación (401)
  - Grupo no existe (404)

- ✅ Flujo completo (1 test)
  - Create → Get → Update → Delete

## 📈 Total Fase 1
- **68 tests e2e implementados**
- **Cobertura:** Auth (100%), Links CRUD (100%), Group Links CRUD (100%)

## 🔜 Próximas fases

### Fase 2 - Funcionalidades avanzadas (~30 tests)
- Paginación (POST /links/paginated, POST /group-links/paginated)
- Favoritos (POST /links/favorite, POST /links/unfavorite)
- Favoritos de grupos (POST /group-links/favorite, POST /group-links/unfavorite)
- Validaciones adicionales

### Fase 3 - Casos avanzados (~43 tests)
- Rate limiting (429)
- Múltiples usuarios (aislamiento de datos)
- Jerarquías complejas de grupos
- Edge cases de paginación

## 🛠️ Notas técnicas

### Helpers disponibles

**AuthHelper:**
- `register(email, password)` - Registra usuario y retorna tokens
- `login(email, password)` - Login y retorna tokens
- `logout(accessToken)` - Logout
- `refresh(refreshToken)` - Refresh tokens
- `createTestUser(prefix)` - Genera usuario de test único

**LinksHelper:**
- `createLink(accessToken, data)` - Crea link
- `getLink(accessToken, id)` - Obtiene link
- `updateLink(accessToken, id, data)` - Actualiza link
- `deleteLink(accessToken, id)` - Elimina link
- `createTestLink(prefix)` - Genera datos de link de test

**GroupLinksHelper:**
- `createGroupLink(accessToken, data)` - Crea grupo
- `getGroupLink(accessToken, id)` - Obtiene grupo
- `updateGroupLink(accessToken, id, data)` - Actualiza grupo
- `deleteGroupLink(accessToken, id)` - Elimina grupo
- `createTestGroupLink(prefix)` - Genera datos de grupo de test

### Configuración

- **maxWorkers: 1** - Tests ejecutan secuencialmente para evitar conflictos de DB
- **testTimeout: 30000** - 30 segundos por test
- **forceExit: true** - Fuerza salida después de tests
- **detectOpenHandles: true** - Detecta handles abiertos

## 🐛 Troubleshooting

### Error: Cannot connect to database
- Verifica que MariaDB esté corriendo
- Verifica credenciales en .env
- Verifica que las bases de datos existan

### Error: Cannot connect to Redis
- Verifica que Redis esté corriendo
- Verifica URLs en .env

### Tests timeout
- Aumenta `testTimeout` en `jest-e2e.config.js`
- Verifica que los servicios no estén sobrecargados

### Tests fallan aleatoriamente
- Verifica que `maxWorkers: 1` esté configurado
- Limpia las bases de datos de test antes de ejecutar
