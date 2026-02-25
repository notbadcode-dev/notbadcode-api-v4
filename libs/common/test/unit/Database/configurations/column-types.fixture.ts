/* eslint-disable no-restricted-syntax */
import { type ColumnOptions } from 'typeorm';

export enum ColumnTypesFixtureEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class ColumnTypesFixture {
  static length(): number {
    return 255;
  }

  static shorterLength(): number {
    return 32;
  }

  static customTransformer(): Required<ColumnOptions>['transformer'] {
    return {
      to: (value: string) => value.toUpperCase(),
      from: (value: string) => value.toLowerCase(),
    };
  }

  static jsonArray(): string[] {
    return ['foo', 'bar'];
  }

  static mixedArray(): unknown[] {
    return ['foo', 123, null, 'bar'];
  }
}
