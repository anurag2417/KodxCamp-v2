// @ts-check

import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./base.js";

/**
 * React + browser config. Extends the base config with browser globals
 * and React-specific rules.
 */
export default [
  ...base,
  {
    files: ["**/*.tsx", "**/*.jsx"],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        // Automatically detect the React version from package.json.
        version: "detect",
      },
    },
    rules: {
      // ---- React rules ----
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ / jsx: react-jsx
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off", // We use TypeScript, not PropTypes
      "react/self-closing-comp": ["error", { component: true, html: true }],
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react/jsx-fragments": ["error", "syntax"],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": "error",
      "react/jsx-no-useless-fragment": "error",

      // ---- Rules of hooks ----
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
