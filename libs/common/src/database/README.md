# Common Database

Artefactos compartidos de base de datos para entidades y columnas reutilizables.

## Subgrupos

- `entities/`
  - `auditable.entity.ts`
  - `deletable.entity.ts`
- `configurations/`
  - tipos/columnas personalizadas (`column-types.ts`)

## Uso

Base para entidades de dominio de `apps/auth` y `apps/links`.

## Regla

Si cambias entidades base o tipos de columna, revisar migraciones implícitas y tests de `libs/common/test/unit/database/**`.
