import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    include: ['**/*.e2e-spec.ts'],
    environment: 'node',
    reporters: ['default'],
    globals: true,
    setupFiles: ['./src/index.ts'],
  },
});
