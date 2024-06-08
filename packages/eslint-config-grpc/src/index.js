import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parser: tseslint.parser,
    },

    rules: {
      curly: 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
      'no-param-reassign': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000'], ['^(node:)'], ['^[^.]'], ['^\\.']],
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          tabWidth: 2,
          printWidth: 100,
          singleQuote: true,
          trailingComma: 'es5',
          endOfLine: 'lf',
        },
      ],
    },
  }
);
