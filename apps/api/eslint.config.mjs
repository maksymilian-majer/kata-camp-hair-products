import { defineConfig } from 'eslint/config';

import baseConfig from '../../eslint.config.mjs';

export default defineConfig([
  ...baseConfig,
  {
    // NestJS uses decorators and reflection metadata for dependency injection
    // Injectable classes used in constructors MUST be value imports, not type imports
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
]);
