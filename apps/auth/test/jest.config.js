/** @type {import('jest').Config} */
module.exports = {
  displayName: 'auth',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../..',
  testMatch: ['<rootDir>/apps/auth/test/unit/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/utils/mocks/jest.mock.responses.ts'],
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

    // Declarative files
    '\\.d\\.ts$',
    '/constants?/|\\.constants?\\.[jt]s$',
    '/enums?/|\\.enums?\\.[jt]s$',
    '/types?/|\\.types?\\.[jt]s$',
    '/interfaces?/|\\.interfaces?\\.[jt]s$',
    '/dtos?/|\\.dtos?\\.[jt]s$',
    '/entities?/|\\.entity\\.[jt]s$',
    '/ports?/|\\.port\\.[jt]s$',
    '/commands?/|\\.command\\.[jt]s$',
    '/queries?/|\\.query\\.[jt]s$',
    '/requests?/|\\.request\\.[jt]s$',
    '/responses?/|\\.response\\.[jt]s$',
    '/specifications?/|\\.specification\\.[jt]s$',

    // Config and barrel exports
    '/index\\.[jt]s$',
    '\\.config\\.[jt]s$',

    // Specific files
    'i18n.service.ts',
    'i18n.service.spec.ts',
    'common-session-control.service.ts',
    'common-session-control.service.spec.ts',
    'api-response.ts',
    'api-response.service.ts',

    // Constructors
    '.*\\.constructor\\..*',
  ],
};
