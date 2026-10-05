import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * auth schema — users, sessions, credentials, consent records.
 *
 * Access rules (per docs/architecture.md):
 *   - Only the core server writes here.
 *   - Other servers can read `users` (id, name, timezone) for display.
 */

export const authSchema = pgSchema("auth");

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = authSchema.table(
  "users",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    email: text("email").notNull(), // citext handled via raw SQL in the migration
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    passwordHash: text("password_hash"),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role").notNull().default("student"),
    status: text("status").notNull().default("active"),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_role_idx").on(t.role),
    check("users_role_check", sql`${t.role} IN ('student', 'instructor', 'admin')`),
    check(
      "users_status_check",
      sql`${t.status} IN ('active', 'pending_terms', 'disabled')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// sessions — refresh tokens with family-based revocation
// ---------------------------------------------------------------------------
export const sessions = authSchema.table(
  "sessions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    familyId: uuid("family_id").notNull(),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    replacedBy: uuid("replaced_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_family_id_idx").on(t.familyId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ],
);

// ---------------------------------------------------------------------------
// oauth_accounts
// ---------------------------------------------------------------------------
export const oauthAccounts = authSchema.table(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    providerEmail: text("provider_email"),
    providerEmailVerified: boolean("provider_email_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("oauth_accounts_provider_user_unique").on(t.provider, t.providerUserId),
    index("oauth_accounts_user_id_idx").on(t.userId),
    check("oauth_accounts_provider_check", sql`${t.provider} IN ('google', 'github')`),
  ],
);

// ---------------------------------------------------------------------------
// email_verification_tokens
// ---------------------------------------------------------------------------
export const emailVerificationTokens = authSchema.table(
  "email_verification_tokens",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("email_verification_tokens_hash_unique").on(t.tokenHash),
    index("email_verification_tokens_user_id_idx").on(t.userId),
  ],
);

// ---------------------------------------------------------------------------
// password_reset_tokens
// ---------------------------------------------------------------------------
export const passwordResetTokens = authSchema.table(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("password_reset_tokens_hash_unique").on(t.tokenHash),
    index("password_reset_tokens_user_id_idx").on(t.userId),
  ],
);

// ---------------------------------------------------------------------------
// user_consents — proof of terms/privacy acceptance
// ---------------------------------------------------------------------------
export const userConsents = authSchema.table(
  "user_consents",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    docType: text("doc_type").notNull(),
    docVersion: text("doc_version").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
  },
  (t) => [
    uniqueIndex("user_consents_unique").on(t.userId, t.docType, t.docVersion),
    check("user_consents_doc_type_check", sql`${t.docType} IN ('terms', 'privacy')`),
  ],
);

// ---------------------------------------------------------------------------
// auth_attempts — rate limiting and lockouts
// ---------------------------------------------------------------------------
export const authAttempts = authSchema.table(
  "auth_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    kind: text("kind").notNull(),
    emailHash: text("email_hash"),
    ipHash: text("ip_hash").notNull(),
    succeeded: boolean("succeeded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("auth_attempts_email_created_idx").on(t.emailHash, t.createdAt),
    index("auth_attempts_ip_created_idx").on(t.ipHash, t.createdAt),
    check(
      "auth_attempts_kind_check",
      sql`${t.kind} IN ('login', 'register', 'forgot_password', 'verify_resend')`,
    ),
  ],
);
