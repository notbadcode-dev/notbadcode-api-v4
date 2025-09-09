/** @type {import('jest').Config} */
module.exports = {
  verbose: true,
  collectCoverage: false,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/test/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'results.xml',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname} - {title}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true',
      },
    ],
  ],
  projects: ['<rootDir>/apps/auth/test/jest.config.js', '<rootDir>/libs/common/test/jest.config.js'],
};
