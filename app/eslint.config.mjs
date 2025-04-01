import eslintJs from '@eslint/js';
import vitestEslintPlugin from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

// Run `npx eslint --inspect-config` to inspect the config

export default [
  {
    ignores: [
      'src/**/*.d.ts',
      'coverage/**/*',
      'build/**/*',
      'dist/**/*',
      '.pipeline/**/*',
      '.docker/**/*',
      'node_modules/**/*'
    ]
  },
  {
    files: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.jsx', 'src/**/*.tsx'],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...vitestEslintPlugin.configs.env.languageOptions.globals
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      prettier: eslintPluginPrettier,
      vitest: vitestEslintPlugin,
      'react-hooks': eslintPluginReactHooks
    },
    rules: {
      // Root ESLint rules
      ...eslintJs.configs.recommended.rules,
      // Root TypeScript rules
      ...typescriptEslint.configs.recommended.rules,
      // Root React Hooks rules
      ...eslintPluginReactHooks.configs.recommended.rules,
      // Root Prettier rules
      ...eslintConfigPrettier.rules,
      // Root Vitest rules
      ...vitestEslintPlugin.configs.recommended.rules,
      // Prettier rules
      'prettier/prettier': ['warn'],
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-redeclare': 'off',
      // Vitest rules
      // General rules
      'no-undef': 'off', // handled by typescript
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'no-lonely-if': 'error',
      curly: 'error'
    }
  }
];
