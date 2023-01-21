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
  testRegex: '.spec.ts$',
  transform: {
    '.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  ...(process.env.CI === 'true' ? coverage : {}),
};

module.exports = config;
