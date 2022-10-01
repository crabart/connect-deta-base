/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/tests/**/*.[jt]s?(x)'],
  coveragePathIgnorePatterns: ['/node_modules/', 'test_lib/*'],
};
