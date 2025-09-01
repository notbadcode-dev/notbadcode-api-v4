/** @type {import('jest').Config} */
module.exports = {
  displayName: 'common',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../..',
  testMatch: ['<rootDir>/libs/common/test/unit/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/libs/common/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@common/test/(.*)$': '<rootDir>/libs/common/test/$1',
    '^@common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^apps/(.*)$': '<rootDir>/apps/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  coverageDirectory: '<rootDir>/test/coverage/common',
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
  ],
};
