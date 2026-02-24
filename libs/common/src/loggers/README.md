# Common Loggers

Configuración unificada de logging para apps del monorepo.

## Archivos

- `common-logger.config.ts`: configuración Winston.
- `common-logger.module.ts`: módulo de logger compartido.
- `index.ts`

## Regla

Cambios de formato/nivel de logs deben evaluarse en ambos servicios (`auth`, `links`).
