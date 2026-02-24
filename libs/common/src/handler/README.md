# Common Handler

Abstracciones base para handlers CQRS.

## Archivos

- `base.handler.ts`: helpers de respuesta éxito/error con i18n.
- `base-paginates.handler.ts`: plantilla para listados paginados.
- `index.ts`: barrel público.

## Contrato

- Handlers de apps deben extender `BaseHandler` o `BasePaginatedHandler`.
- Respuestas deben mantenerse en `ApiResponse<T>`.

## Regla

No introducir lógica HTTP en handlers base; solo orquestación de aplicación y construcción de respuesta.
