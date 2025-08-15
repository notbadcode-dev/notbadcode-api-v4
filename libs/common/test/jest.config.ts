import type { Config } from 'jest';

const config: Config = {
  displayName: 'common',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../..',
  testMatch: ['<rootDir>/libs/common/test/unit/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/libs/common/tsconfig.build.json',
    },
  },
};

export default config;
