import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema/index.ts";

/**
 * Drizzle client factory. Creates a Drizzle instance on top of a Postgres
 * pool. Consumed by every service that talks to the database.
 *
 * `pg` is CommonJS with no proper ESM exports, so `import { Pool } from "pg"`
 * fails under NodeNext. We use the default namespace import and destructure
 * at runtime.
 */

const { Pool } = pg;
type PoolType = InstanceType<typeof Pool>;

export interface DbClient {
  db: ReturnType<typeof drizzle<typeof schema>>;
  pool: PoolType;
  close: () => Promise<void>;
}

/**
 * Creates a Drizzle client connected to Postgres at the given URL.
 * Callers are responsible for calling `close()` when done.
 */
export function createDbClient(connectionString: string): DbClient {
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30_000,
  });

  pool.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });

  const db = drizzle(pool, { schema });

  return {
    db,
    pool,
    close: async () => {
      await pool.end();
    },
  };
}

/**
 * Convenience: reads DATABASE_URL from the environment. Throws if not set.
 */
export function createDbClientFromEnv(): DbClient {
  const url = process.env["DATABASE_URL"];
  if (url === undefined || url === "") {
    throw new Error("DATABASE_URL is not set");
  }
  return createDbClient(url);
}
