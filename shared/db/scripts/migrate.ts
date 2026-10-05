import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { loadRootEnv } from "../src/load-env.js";

loadRootEnv();

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(__dirname, "..", "migrations");

async function main(): Promise<void> {
  const url = process.env["DATABASE_URL_DIRECT"];
  if (url === undefined || url === "") {
    console.error("DATABASE_URL_DIRECT is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 10_000,
  });

  try {
    const db = drizzle(pool);
    console.log(`[migrate] applying migrations from ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log("[migrate] done");
  } catch (err) {
    console.error("[migrate] failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error("[migrate] uncaught:", err);
  process.exit(1);
});
