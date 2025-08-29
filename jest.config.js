module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/test/coverage',
  projects: ['<rootDir>/apps/auth/test/jest.config.js', '<rootDir>/libs/common/test/jest.config.js'],
};
