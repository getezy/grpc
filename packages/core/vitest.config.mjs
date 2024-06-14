import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    environment: 'node',
    reporters: ['default'],
    globals: true,
    coverage: {
      include: ['src/**'],
      reporter: ['text', 'json', 'html'],
    },
    passWithNoTests: true,
  },
});
