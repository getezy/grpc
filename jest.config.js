/**
 * @type {import('jest').Config}
 * */
const coverage = {
  ci: true,
  collectCoverage: true,
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageReporters: ['text', 'cobertura'],
};

/**
 * @type {import('jest').Config}
 * */
const config = {
  rootDir: './lib',
  verbose: true,

  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/__tests__/__utils__/'],
  coveragePathIgnorePatterns: ['<rootDir>/__tests__/'],
  testRegex: '.spec.ts$',
  transform: {
    '.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '@loaders': '<rootDir>/loaders/index.ts',
    '@protocols': '<rootDir>/protocols/index.ts',
    '@client': '<rootDir>/client/index.ts',
  },
  ...(process.env.CI === 'true' ? coverage : {}),
};

module.exports = config;
