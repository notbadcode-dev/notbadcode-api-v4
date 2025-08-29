module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/test/coverage',
  reporters: ['default', ['jest-junit', { outputDirectory: 'reports/junit', outputName: 'results.xml' }]],
  projects: ['<rootDir>/apps/auth/test/jest.config.js', '<rootDir>/libs/common/test/jest.config.js'],
};
