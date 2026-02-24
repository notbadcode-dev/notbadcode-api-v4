# Common Constants

Constantes compartidas para errores, seguridad, swagger, paginación, logger y símbolos.

## Uso

- Evitar hardcodear strings repetidos en apps.
- Centralizar mensajes/restricciones transversales.

## Archivos clave

- `swagger.constants.ts`
- `security.constants.ts`
- `common-error-message.constants.ts`
- `paginated.constants.ts`

## Regla

Si una constante afecta contrato HTTP o seguridad, actualizar también `docs/CONTRACTS.md` o `docs/SECURITY.md`.
