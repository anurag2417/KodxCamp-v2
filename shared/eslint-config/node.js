// @ts-check

import globals from "globals";

import base from "./base.js";

/**
 * Node-specific config. Extends the base config with Node globals
 * and rules for server-side code.
 */
export default [
  ...base,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Allow console.log in Node services (they use it as a real output channel)
      "no-console": "off",
      // Server code often has to dynamically require things
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
