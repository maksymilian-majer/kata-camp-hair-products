import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Allow relative imports in shared library (self-contained package)
      'no-relative-import-paths/no-relative-import-paths': 'off',
    },
  },
];
