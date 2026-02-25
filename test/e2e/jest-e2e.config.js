module.exports = {
  displayName: 'e2e',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../../tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../../libs/common/src/$1',
    '^@apps/auth/(.*)$': '<rootDir>/../../apps/auth/$1',
    '^@apps/links/(.*)$': '<rootDir>/../../apps/links/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
};
