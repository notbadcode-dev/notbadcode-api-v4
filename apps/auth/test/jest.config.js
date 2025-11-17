/** @type {import('jest').Config} */
module.exports = {
  displayName: 'auth',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../..',
  testMatch: ['<rootDir>/apps/auth/test/unit/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/apps/auth/tsconfig.spec.json',
        diagnostics: false,
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@common/test/(.*)$': '<rootDir>/libs/common/test/$1',
    '^@common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^@apps/(.*)$': '<rootDir>/apps/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  coverageDirectory: '<rootDir>/test/coverage/auth',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '\\.(spec|test|fixture|mock)\\.[jt]s$',
    '/constants?/|\\.constants?\\.[jt]s$',
    '/enums?/|\\.enums?\\.[jt]s$',
    '/types?/|\\.types?\\.[jt]s$',
    '/interfaces?/|\\.interfaces?\\.[jt]s$',
    '/dtos?/|\\.dtos?\\.[jt]s$',
    '/index\\.[jt]s$',
    '\\.config\\.[jt]s$',
    '/entities?/|\\.entity\\.[jt]s$',

    // Specific files
    'i18n.service.ts',
    'i18n.service.spec.ts',
    'commonSessionControl.service.ts',
    'commonSessionControl.service.spec.ts',
    'apiResponse.ts',
    'apiResponse.service.ts',
  ],
};
