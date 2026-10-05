/**
 * @kodxcamp/db — Drizzle schema, migrations, and client for KodxCamp.
 *
 * Consumers import:
 *   - `createDbClient` / `createDbClientFromEnv` to get a Drizzle instance
 *   - anything from `./schema` for typed table access
 *
 * Migration tooling (drizzle-kit, scripts/migrate.ts) is separate and runs
 * only at build/deploy time.
 *
 * Note on import extensions: this package uses `.ts` extensions on relative
 * imports (not the usual `.js`). This is required because Drizzle Kit loads
 * our schema files through its own `require()`-based loader, which resolves
 * files on disk literally — no `.js`-to-`.ts` mapping. `allowImportingTsExtensions`
 * in tsconfig makes TypeScript accept this without complaint.
 */

export * from "./client.ts";
export * as schema from "./schema/index.ts";
