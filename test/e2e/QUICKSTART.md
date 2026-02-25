# E2E Tests - Quick Start (Opción B)

Los tests e2e ahora hacen requests HTTP directos a servicios corriendo.

## 🚀 Ejecutar tests

### 1. Levantar servicios (en terminales separadas)

**Terminal 1 - Auth:**
```bash
npm run start:auth:dev
```
Debe mostrar: `Application is running on: https://localhost:60200`

**Terminal 2 - Links:**
```bash
npm run start:links:dev
```
Debe mostrar: `Application is running on: https://localhost:60201`

### 2. Ejecutar tests (terminal 3)

```bash
npm run test:e2e
```

**El script verificará automáticamente que los servicios estén corriendo. Si no lo están, los tests se detendrán inmediatamente.**

## ✅ Ventajas de este approach

- ✅ **Simple**: No requiere TestingModule complejo
- ✅ **Rápido setup**: Solo levantar servicios
- ✅ **Realista**: Tests contra aplicaciones reales
- ✅ **Falla rápido**: Si servicios no están corriendo, para inmediatamente

## 🎯 Tests disponibles

```bash
npm run test:e2e              # Todos los tests
npm run test:e2e:auth         # Solo Auth (21 tests)
npm run test:e2e:links        # Solo Links (22 tests)
npm run test:e2e:group-links  # Solo Group Links (25 tests)
```

## 📝 Notas

- Los servicios deben estar corriendo ANTES de ejecutar tests
- Usa bases de datos de desarrollo (no test)
- Los datos creados en tests quedarán en la DB
- Para limpiar datos: reinicia servicios o limpia manualmente

## 🐛 Troubleshooting

### Error: Auth service no responde
```bash
# Verificar puerto
lsof -i :60200

# Reiniciar servicio
# Ctrl+C en terminal de auth
npm run start:auth:dev
```

### Error: Links service no responde
```bash
# Verificar puerto
lsof -i :60201

# Reiniciar servicio
# Ctrl+C en terminal de links
npm run start:links:dev
```

### Los servicios no inician
```bash
# Verificar que Docker esté corriendo con MariaDB y Redis
npm run docker:ps

# Si no están, levantarlos
docker compose up -d mariadb redis-session redis-cache
```
