# Common Responses

Contrato de respuestas uniforme para toda la API.

## Subgrupos

- `api-response/`: envelope base (`success`, `data`, `messageList`, `code`) + swagger helpers.
- `paginated-response/`: contrato paginado y factory swagger.
- `success-failure-response/`: resultado parcial para operaciones batch.
- `healtz-response/`: interfaz para endpoint de salud.
- `index.ts`: exports públicos.

## Regla

No romper forma del envelope sin actualizar `docs/CONTRACTS.md` y consumidores.
