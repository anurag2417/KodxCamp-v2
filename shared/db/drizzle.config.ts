import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 *
 * Env loading is inlined here because Drizzle Kit's config loader runs the
 * file in a CJS-ish context: `import.meta.url` isn't available, and `.js`
 * imports that map to `.ts` files fail to resolve. We use `process.cwd()`
 * and check both plausible locations for `.env.local`.
 */

function findEnvFile(): string | undefined {
  const candidates = [
    resolve(process.cwd(), ".env.local"), // repo root
    resolve(process.cwd(), "..", "..", ".env.local"), // shared/db
  ];
  return candidates.find((p) => existsSync(p));
}

const envPath = findEnvFile();
if (envPath !== undefined) {
  const content = readFileSync(envPath, "utf-8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key !== "" && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env["DATABASE_URL_DIRECT"] ?? "",
  },
  verbose: true,
  strict: true,
});
