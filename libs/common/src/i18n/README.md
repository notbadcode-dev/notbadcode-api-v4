# Common i18n

Infraestructura de internacionalización para APIs.

## Archivos

- `common-i18n.module.ts`: módulo i18n compartido.
- `i18n.service.ts`: wrapper de traducción.
- `i18n.config.ts`: configuración de loader/fallback.
- `en/*.json` y `es/*.json`: catálogos de mensajes.

## Regla

Si agregas nuevas keys de error/mensaje usadas por DTOs o handlers, incluir traducciones en ambos idiomas.
