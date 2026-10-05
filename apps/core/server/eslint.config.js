// @ts-check

import nodeConfig from "@kodxcamp/eslint-config/node";

export default [
  {
    // tsup.config.ts lives outside src/ and isn't part of the tsconfig's
    // `include` list. Rather than wiring it into the project service, we
    // ignore it — it's a 15-line static build config with no logic worth
    // linting. If it ever grows real logic, add it to tsconfig's include
    // and remove this ignore.
    ignores: ["tsup.config.ts", "dist/**"],
  },
  ...nodeConfig,
];
