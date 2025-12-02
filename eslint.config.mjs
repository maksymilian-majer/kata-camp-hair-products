import nx from '@nx/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
  globalIgnores(['**/dist', '**/vitest.config.*.timestamp*', '**/coverage']),
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: importPlugin,
      'no-relative-import-paths': noRelativeImportPaths,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            // Allow @/api/* and @/web/* for same-project imports
            '^@/api/.*$',
            '^@/web/.*$',
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

      // Code quality and security rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'prefer-promise-reject-errors': 'error',
      'prefer-const': 'error',
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],

      // Import organization and sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Import quality rules
      'import/no-duplicates': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-self-import': 'error',
      'import/prefer-default-export': 'off',
      'import/order': 'off',

      // Enforce @/ alias for parent imports, allow ./ for same folder
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true },
      ],

      // Unused imports cleanup
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
    },
  },
  // Test files - allow longer functions
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  // Prettier configuration - MUST be last
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
]);
