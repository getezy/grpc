import tseslint from 'typescript-eslint';

import config from '@getezy/eslint-config-grpc';

export default tseslint.config(...config, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

