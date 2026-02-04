import { type ColumnOptions } from 'typeorm';

export const ColumnVarchar = (length: number, nullable = false): ColumnOptions => ({
  type: 'varchar',
  length,
  nullable,
});

export const ColumnVarcharWithTransform = (length: number, nullable = false, transformer: ColumnOptions['transformer']): ColumnOptions => ({
  type: 'varchar',
  length,
  nullable,
  transformer,
});

export const ColumnBoolean = (defaultValue = false): ColumnOptions => ({
  type: 'tinyint',
  default: defaultValue ? 1 : 0,
  transformer: {
    to: (v: boolean) => (v ? 1 : 0),
    from: (v: number) => v === 1,
  },
});

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const isRgbColor = (value: unknown): value is RgbColor =>
  typeof value === 'object' &&
  value !== null &&
  'r' in value &&
  'g' in value &&
  'b' in value &&
  typeof (value as RgbColor).r === 'number' &&
  typeof (value as RgbColor).g === 'number' &&
  typeof (value as RgbColor).b === 'number';

export const ColumnJsonRgb = (nullable = true): ColumnOptions => ({
  type: 'json',
  nullable,
  transformer: {
    to: (value: RgbColor | null): RgbColor | null => (isRgbColor(value) ? { r: value.r, g: value.g, b: value.b } : null),
    from: (value: unknown): RgbColor | null => (isRgbColor(value) ? { r: value.r, g: value.g, b: value.b } : null),
  },
});

export const ColumnJsonArray = (nullable = true): ColumnOptions => ({
  type: 'json',
  nullable,
  transformer: {
    to: (value: string[] | null) => (Array.isArray(value) ? value : []),
    from: (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      return value.filter((v): v is string => typeof v === 'string');
    },
  },
});

export const ColumnDateTimeNonNullable = (precision = 0): ColumnOptions => ({
  type: 'datetime',
  precision,
  nullable: false,
});

export const ColumnDateTimeNullable = (precision = 0): ColumnOptions => ({
  type: 'datetime',
  precision,
  nullable: true,
});

export const ColumnEnumNonNullable = <T>(enumObj: T, defaultValue?: T[keyof T]): ColumnOptions => ({
  type: 'enum',
  enum: enumObj as Omit<T, keyof T>[],
  nullable: false,
  default: defaultValue,
});

export const ColumnEnumNullable = <T>(enumObj: Omit<T, keyof T>[], defaultValue?: T[keyof T]): ColumnOptions => ({
  type: 'enum',
  enum: enumObj,
  nullable: true,
  default: defaultValue,
});
