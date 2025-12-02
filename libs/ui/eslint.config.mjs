import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Allow relative imports in UI library (self-contained package)
      'no-relative-import-paths/no-relative-import-paths': 'off',
    },
  },
];
