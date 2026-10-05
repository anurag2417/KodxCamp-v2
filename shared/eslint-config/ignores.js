// @ts-check

/**
 * Directories and file patterns ESLint must never lint.
 * Kept as a separate module so every workspace's flat config can spread it in.
 */
export const ignores = {
  ignores: [
    // Dependencies
    "**/node_modules/**",
    "**/.pnpm-store/**",

    // Build outputs
    "**/dist/**",
    "**/build/**",
    "**/out/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/*.tsbuildinfo",

    // Coverage and test artifacts
    "**/coverage/**",
    "**/.nyc_output/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "**/blob-report/**",

    // Content build output
    "content/dist/**",

    // Generated migrations (Drizzle writes these as SQL; lint skips them)
    "shared/db/migrations/**",

    // Config files that aren't worth linting individually
    "**/*.config.js",
    "**/*.config.mjs",
    "**/*.config.cjs",

    // Repo-level scripts folder: not part of any TS project
    "scripts/**",
  ],
};
