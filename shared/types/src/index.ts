/**
 * @kodxcamp/types — shared TypeScript types across the monorepo.
 *
 * Types are exported from dedicated modules (api, auth, access, content,
 * stats) and re-exported here for convenience. Import from the specific
 * module when possible to keep dependency boundaries clear:
 *
 *   import type { ApiError } from "@kodxcamp/types/api";
 *   import type { UserRole } from "@kodxcamp/types/auth";
 */

export * from "./api.types.js";
export * from "./auth.types.js";
export * from "./access.types.js";
export * from "./content.types.js";
export * from "./stats.types.js";
