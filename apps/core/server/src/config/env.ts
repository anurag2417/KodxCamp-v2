import { z } from "zod";

/**
 * Typed environment configuration. Fails fast at boot if a required env var
 * is missing or malformed — no silent defaults for anything security-relevant.
 *
 * Only the variables this service actually needs are declared here. Every
 * env var in the repo is documented in the root `.env.example`.
 */

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4001),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  DATABASE_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
