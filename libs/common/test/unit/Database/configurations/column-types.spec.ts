import {
  ColumnBoolean,
  ColumnDateTimeNonNullable,
  ColumnDateTimeNullable,
  ColumnEnumNonNullable,
  ColumnEnumNullable,
  ColumnJsonArray,
  ColumnJsonRgb,
  ColumnVarchar,
  ColumnVarcharWithTransform,
} from '@common/database/configurations/column-types';

import { ColumnTypesFixture, ColumnTypesFixtureEnum } from './column-types.fixture';

describe('column-types configuration helpers', () => {
  describe('ColumnVarchar', () => {
    it('should build a varchar column with default nullable false', () => {
      const options = ColumnVarchar(ColumnTypesFixture.length());

      expect(options).toEqual({
        type: 'varchar',
        length: ColumnTypesFixture.length(),
        nullable: false,
      });
    });

    it('should allow nullable override', () => {
      const options = ColumnVarchar(ColumnTypesFixture.length(), true);

      expect(options.nullable).toBe(true);
    });
  });

  describe('ColumnVarcharWithTransform', () => {
    it('should include the provided transformer', () => {
      const transformer = ColumnTypesFixture.customTransformer();
      const options = ColumnVarcharWithTransform(ColumnTypesFixture.shorterLength(), false, transformer);

      expect(options).toMatchObject({
        type: 'varchar',
        length: ColumnTypesFixture.shorterLength(),
        transformer,
      });
    });

    it('should use nullable default when not provided', () => {
      const transformer = ColumnTypesFixture.customTransformer();
      const options = ColumnVarcharWithTransform(ColumnTypesFixture.shorterLength(), undefined, transformer);

      expect(options.nullable).toBe(false);
    });
  });

  describe('ColumnBoolean', () => {
    it('should default to tinyint with boolean transformer', () => {
      const options = ColumnBoolean();
      const transformer = options.transformer;

      expect(options.type).toBe('tinyint');
      expect(options.default).toBe(0);
      expect(transformer?.to(true)).toBe(1);
      expect(transformer?.to(false)).toBe(0);
      expect(transformer?.from(1)).toBe(true);
      expect(transformer?.from(0)).toBe(false);
    });

    it('should allow custom default value', () => {
      const options = ColumnBoolean(true);

      expect(options.default).toBe(1);
    });
  });

  describe('ColumnJsonArray', () => {
    it('should serialize arrays and guard against non-array inputs', () => {
      const options = ColumnJsonArray();
      const transformer = options.transformer;

      expect(transformer?.to(ColumnTypesFixture.jsonArray())).toEqual(ColumnTypesFixture.jsonArray());
      expect(transformer?.to(null)).toEqual([]);

      expect(transformer?.from(ColumnTypesFixture.jsonArray())).toEqual(ColumnTypesFixture.jsonArray());
      expect(transformer?.from(ColumnTypesFixture.mixedArray())).toEqual(['foo', 'bar']);
      expect(transformer?.from('not-an-array')).toEqual([]);
    });

    it('should allow overriding nullable flag', () => {
      const options = ColumnJsonArray(false);

      expect(options.nullable).toBe(false);
    });
  });

  describe('ColumnJsonRgb', () => {
    it('should serialize/deserialize valid rgb values', () => {
      const options = ColumnJsonRgb();
      const transformer = options.transformer;
      const rgb = { r: 10, g: 20, b: 30 };

      expect(transformer?.to(rgb)).toEqual(rgb);
      expect(transformer?.from(rgb)).toEqual(rgb);
    });

    it('should map invalid rgb values to null', () => {
      const options = ColumnJsonRgb(false);
      const transformer = options.transformer;

      expect(options.nullable).toBe(false);
      expect(transformer?.to(null)).toBeNull();
      expect(transformer?.to({ r: 10, g: 20 } as unknown as { r: number; g: number; b: number })).toBeNull();
      expect(transformer?.from('invalid')).toBeNull();
    });
  });

  describe('ColumnDateTime', () => {
    it('should set nullable false for non nullable columns', () => {
      const options = ColumnDateTimeNonNullable(3);

      expect(options).toEqual({
        type: 'datetime',
        precision: 3,
        nullable: false,
      });
    });

    it('should use default precision when not provided', () => {
      const options = ColumnDateTimeNonNullable();

      expect(options.precision).toBe(0);
    });

    it('should set nullable true for nullable columns', () => {
      const options = ColumnDateTimeNullable(6);

      expect(options).toEqual({
        type: 'datetime',
        precision: 6,
        nullable: true,
      });
    });
  });

  describe('ColumnEnum', () => {
    it('should build a non-nullable enum column and keep default', () => {
      const options = ColumnEnumNonNullable(ColumnTypesFixtureEnum, ColumnTypesFixtureEnum.ACTIVE);

      expect(options.type).toBe('enum');
      expect(options.enum).toBe(ColumnTypesFixtureEnum);
      expect(options.nullable).toBe(false);
      expect(options.default).toBe(ColumnTypesFixtureEnum.ACTIVE);
    });

    it('should build a nullable enum column with provided enum array', () => {
      const enumArray = Object.values(ColumnTypesFixtureEnum);
      const options = ColumnEnumNullable(enumArray, ColumnTypesFixtureEnum.INACTIVE);

      expect(options.type).toBe('enum');
      expect(options.enum).toBe(enumArray);
      expect(options.nullable).toBe(true);
      expect(options.default).toBe(ColumnTypesFixtureEnum.INACTIVE);
    });
  });
});
