module.exports = () => ({
  autoDetect: true,

  files: ['lib/**/*.ts', '!lib/**/*.spec.ts'],

  tests: ['lib/**/*.spec.ts'],

  env: {
    type: 'node',
  },
});
