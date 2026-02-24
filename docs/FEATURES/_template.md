# <FEATURE_NAME>

## Objetivo

Describe en 2-4 líneas qué responsabilidad de negocio cubre esta feature.

## Alcance Y Límites

Incluye:
- Endpoints/controladores de la feature.
- Commands/queries/handlers propios.
- Entidades/puertos del dominio involucrado.

No incluye:
- Infraestructura transversal de `libs/common` que no sea específica de la feature.

## Endpoints

- Lista de rutas y método HTTP.
- Indicar si requieren auth.

## Flujo De Datos

1. Entrada HTTP (controller + DTO).
2. Dispatch CQRS (command/query).
3. Regla de dominio/servicio.
4. Persistencia (repositorio).
5. Envelope de salida.

## Contratos Clave

Entrada:
- Requests y validaciones principales.

Salida:
- Responses principales y códigos esperados.

## Dependencias

- `libs/common` usados por la feature.
- Dependencias cruzadas con otras apps/librerías.

## Known Decisions

- Decisiones no obvias que condicionan cambios futuros.

## Reglas De Cambio Seguro

- Qué no romper.
- Qué tests ejecutar mínimo.
- Qué docs actualizar junto al cambio.

## Checklist De PR (<FEATURE_NAME>)

- `npm run lint`
- tests del scope (`npm run test:<scope>`)
- actualización de docs (`CONTRACTS`, `SECURITY`, `FEATURES/<feature>`) si aplica
