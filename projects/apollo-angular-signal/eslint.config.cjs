// @ts-check
const { defineConfig } = require("eslint/config");
const rootConfig = require("../../eslint.config.cjs");
const angular = require('angular-eslint');

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "gql",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "gql",
          style: "kebab-case",
        },
      ],
    },
  }
]);
