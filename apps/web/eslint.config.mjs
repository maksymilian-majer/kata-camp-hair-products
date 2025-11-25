import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';

import baseConfig from '../../eslint.config.mjs';

export default defineConfig([
  globalIgnores(['.next/**/*', 'next-env.d.ts']),
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  reactCompiler.configs.recommended,
  {
    plugins: {
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Override import sorting with React-specific groups
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js built-ins
            ['^node:', '^\\u0000'],
            // External packages (react first)
            ['^react', '^next', '^@?\\w'],
            // Internal packages (absolute imports)
            ['^@hair-product-scanner/', '^@/'],
            // Parent imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Relative imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports
            ['^.+\\.s?css$', '^.+\\.module\\.s?css$'],
          ],
        },
      ],

      // React rules
      'react/display-name': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-object-type-as-default-prop': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unused-state': 'warn',
      'react/prefer-stateless-function': 'warn',
      'react/no-redundant-should-component-update': 'error',
      'react/self-closing-comp': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX A11y rules - Critical accessibility issues
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-redundant-roles': 'warn',
    },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: { 'testing-library': testingLibrary },
    rules: {
      ...testingLibrary.configs.react.rules,
      'testing-library/prefer-screen-queries': 'error',
      'testing-library/no-debugging-utils': 'error',
      'testing-library/prefer-user-event': 'warn',
      'testing-library/no-wait-for-multiple-assertions': 'error',
      'testing-library/no-wait-for-side-effects': 'error',
      'testing-library/no-node-access': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
