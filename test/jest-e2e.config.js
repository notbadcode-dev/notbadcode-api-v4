module.exports = {
  displayName: 'global-e2e',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/e2e/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../libs/common/src/$1',
    '^@test/(.*)$': '<rootDir>/$1',
    '^@apps/(.*)$': '<rootDir>/../apps/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
};
