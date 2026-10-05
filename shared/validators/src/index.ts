/**
 * @kodxcamp/validators — Zod schemas for API contracts.
 *
 * Every Express route's request body and query params are validated with
 * a schema from this package. Schemas live next to the module they serve
 * (auth, access, learn, etc.) and are re-exported here for convenience.
 */

export * from "./common.js";
export * from "./auth.schemas.js";
export * from "./access.schemas.js";
export * from "./account.schemas.js";
export * from "./learn.schemas.js";
export * from "./practice.schemas.js";
export * from "./live.schemas.js";
export * from "./snippet.schemas.js";
