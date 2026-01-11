// @ts-check
const eslint = require("@eslint/js");
const { defineConfig  } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended],
    rules: {
      '@angular-eslint/template/eqeqeq': [
        'error',
        {
          allowNullOrUndefined: true,
        },
      ],
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
    },
  },
]);
