/**
 * @kodxcamp/db — Drizzle schema, migrations, and client for KodxCamp.
 *
 * Consumers import:
 *   - `createDbClient` / `createDbClientFromEnv` to get a Drizzle instance
 *   - anything from `./schema` for typed table access
 *
 * Migration tooling (`drizzle-kit`, `scripts/migrate.ts`) is separate and
 * runs only at build/deploy time.
 */

export * from "./client.js";
export * as schema from "./schema/index.js";
