/**
 * @kodxcamp/server-kit — shared helpers for KodxCamp Express services.
 *
 * Every server imports from this package for consistent behavior:
 *   - AppError + error handler → uniform JSON error shape
 *   - request ID middleware → traceable requests
 *   - logger → structured logs
 *   - security middleware → helmet with sane defaults
 *   - rate limit → per-route IP throttling
 *   - validate → Zod schema validation of req.body/query/params
 *   - health → /health and /health/db endpoints
 *   - sentry → error reporting (no-op if SENTRY_DSN is unset)
 */

export * from "./app-error.js";
export * from "./async-handler.js";
export * from "./error-handler.js";
export * from "./logger.js";
export * from "./security.js";
export * from "./rate-limit.js";
export * from "./request-id.js";
export * from "./validate.js";
export * from "./health.js";
export * from "./sentry.js";
