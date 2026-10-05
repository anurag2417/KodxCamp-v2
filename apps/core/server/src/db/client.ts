import pg from "pg";

import { env } from "../config/env.js";

/**
 * Postgres connection pool. Created lazily — if DATABASE_URL is not set
 * (Phase 0, before we have a real DB), we return null and /health/db
 * responds "unreachable" instead of crashing the server.
 *
 * Phase 1a will add Drizzle on top of this same pool.
 *
 * Note on `pg`'s CommonJS interop: `pg` is a CJS package without ESM exports,
 * so `import { Pool } from "pg"` fails under NodeNext. We use the default
 * namespace import and destructure at runtime instead.
 */

const { Pool } = pg;
type PoolType = InstanceType<typeof Pool>;

let pool: PoolType | null = null;

export function getPool(): PoolType | null {
  if (env.DATABASE_URL === undefined || env.DATABASE_URL === "") {
    return null;
  }
  if (pool === null) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      // Neon free tier: keep the pool small; we're the only consumer.
      max: 5,
      // Fail fast if the DB is unreachable — do not hang requests.
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30_000,
    });
    pool.on("error", (err) => {
      console.error("[db] idle client error:", err.message);
    });
  }
  return pool;
}

/**
 * Pings the database with a lightweight query. Used by /health/db.
 * Rejects if the DB is unreachable or DATABASE_URL is unset.
 */
export async function pingDb(): Promise<void> {
  const p = getPool();
  if (p === null) {
    throw new Error("DATABASE_URL is not set");
  }
  await p.query("SELECT 1");
}

/**
 * Closes the pool. Called on graceful shutdown.
 */
export async function closePool(): Promise<void> {
  if (pool !== null) {
    await pool.end();
    pool = null;
  }
}
