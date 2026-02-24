# Common Src (`libs/common/src`)

Punto de entrada de documentación para la librería compartida de backend.

## Mapa Rápido

- API y tipos de auth compartidos:
  - [`auth/README.md`](auth/README.md)
- Configuración transversal (env, security, swagger):
  - [`config/README.md`](config/README.md)
- Constantes compartidas:
  - [`constants/README.md`](constants/README.md)
- Contexto request-scoped:
  - [`context/README.md`](context/README.md)
- Modelo base de persistencia y utilidades DB:
  - [`database/README.md`](database/README.md)
- Decoradores HTTP compartidos:
  - [`decorators/README.md`](decorators/README.md)
- Filtros globales:
  - [`filters/README.md`](filters/README.md)
- Guard y contrato de acceso JWT:
  - [`guards/README.md`](guards/README.md)
- CQRS base handlers:
  - [`handler/README.md`](handler/README.md)
- Helpers reutilizables:
  - [`helpers/README.md`](helpers/README.md)
- Internacionalización:
  - [`i18n/README.md`](i18n/README.md)
- Interceptors de infraestructura:
  - [`interceptors/README.md`](interceptors/README.md)
- Logger compartido:
  - [`loggers/README.md`](loggers/README.md)
- DTOs request compartidos:
  - [`requests/README.md`](requests/README.md)
- Redis cache/sesión:
  - [`redis/README.md`](redis/README.md)
- Contratos de respuesta API:
  - [`responses/README.md`](responses/README.md)
- Rate limiting:
  - [`throttler/README.md`](throttler/README.md)

## Contrato Público

Exports públicos por barrel `index.ts` en cada subcarpeta (`@common/*`).

## Carpetas Sin README (Intencional)

- `enums`, `types`, `value-objects`:
  - actualmente son grupos pequeños y autoexplicativos.
  - si crecen en superficie pública, agregar `README.md`.

## Regla De Mantenimiento

Si cambia contrato público de un subgrupo, actualizar su `README.md` en la misma PR.
