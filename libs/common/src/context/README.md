# Common Context

Servicios de contexto de request compartidos.

## Archivos

- `request-context.service.ts`: acceso al contexto actual de petición.
- `index.ts`: barrel público.

## Cuándo usar

- Correlación de logs.
- Propagación de metadata request-scoped sin acoplar controllers y servicios.

## Regla

Mantenerlo libre de lógica de negocio; solo contexto transversal.
