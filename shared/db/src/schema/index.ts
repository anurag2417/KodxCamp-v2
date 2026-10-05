/**
 * Schema barrel. Every schema file is re-exported from here. Drizzle Kit
 * reads THIS file to discover the schema for migration generation.
 *
 * Note on import extensions: we use `.ts` extensions (not `.js`) because
 * Drizzle Kit loads these files via `require()` in a CommonJS context where
 * `.js` doesn't map to `.ts`. `allowImportingTsExtensions` in tsconfig makes
 * TypeScript accept this.
 *
 * Schemas not yet written (learn, practice, live) arrive in later phases.
 */

export * from "./auth.ts";
export * from "./access.ts";
export * from "./core.ts";
export * from "./stats.ts";
