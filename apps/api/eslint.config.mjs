import { defineConfig } from 'eslint/config';

import baseConfig from '../../eslint.config.mjs';

export default defineConfig([
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
]);
