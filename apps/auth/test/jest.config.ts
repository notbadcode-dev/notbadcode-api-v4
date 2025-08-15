import type { Config } from 'jest';

const config: Config = {
  displayName: 'auth',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../..',
  testMatch: ['<rootDir>/apps/auth/test/unit/**/*.spec.ts', '<rootDir>/apps/auth/test/e2e/**/*.e2e-spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^apps/(.*)$': '<rootDir>/apps/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/apps/auth/tsconfig.json',
    },
  },
};

export default config;
