import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Minimal .env file loader. Reads `KEY=value` pairs from a file and assigns
 * them to process.env — only if the key is not already set (so real
 * environment variables win over the file).
 *
 * Used by scripts (migrate, seed) that run outside a server context and
 * don't have env vars injected by the platform.
 */
export function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }
  const content = readFileSync(filePath, "utf-8");
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
    if (key === "" || key in process.env) {
      continue;
    }
    process.env[key] = value;
  }
}

/**
 * Loads the repo root's `.env.local`. Idempotent — safe to call multiple times.
 */
export function loadRootEnv(): void {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // From shared/db/src/load-env.ts → ../../../.env.local
  const envPath = resolve(__dirname, "..", "..", "..", ".env.local");
  loadEnvFile(envPath);
}
