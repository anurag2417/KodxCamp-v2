// @ts-check

import nodeConfig from "@kodxcamp/eslint-config/node";

export default [
  {
    // Migration SQL files are generated; nothing to lint there.
    ignores: ["migrations/**"],
  },
  ...nodeConfig,
];
