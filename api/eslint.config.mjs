import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginMocha from 'eslint-plugin-mocha';
import eslintPluginPrettier from 'eslint-plugin-prettier';
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
        ...eslintPluginMocha.configs.flat.recommended.languageOptions.globals
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      prettier: eslintPluginPrettier,
      mocha: eslintPluginMocha.configs.flat.recommended.plugins.mocha
    },
    rules: {
      // Root ESLint rules
      ...eslintJs.configs.recommended.rules,
      // Root TypeScript rules
      ...typescriptEslint.configs.recommended.rules,
      // Root Prettier rules
      ...eslintConfigPrettier.rules,
      // Root Mocha rules
      ...eslintPluginMocha.configs.flat.recommended.rules,
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
      // Mocha rules
      'mocha/no-mocha-arrows': 'off',
      'mocha/no-setup-in-describe': 'off',
      'mocha/max-top-level-suites': 'off',
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
