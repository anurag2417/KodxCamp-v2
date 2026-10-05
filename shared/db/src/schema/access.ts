import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth.ts";

/**
 * access schema — coupons, redemptions, grants, payments.
 *
 * Access rule (per ADR-0006): everything gated checks for a grant.
 * Coupons and payments both create grants. Admin actions create grants.
 */

export const accessSchema = pgSchema("access");

// ---------------------------------------------------------------------------
// coupons
// ---------------------------------------------------------------------------
export const coupons = accessSchema.table(
  "coupons",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    code: text("code").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeCode: text("scope_code"),
    maxRedemptions: integer("max_redemptions"),
    redeemedCount: integer("redeemed_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    grantDurationDays: integer("grant_duration_days"),
    campaign: text("campaign"),
    note: text("note"),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("coupons_code_unique").on(t.code),
    index("coupons_campaign_idx").on(t.campaign),
    index("coupons_scope_idx").on(t.scopeType, t.scopeCode),
    check(
      "coupons_scope_type_check",
      sql`${t.scopeType} IN ('course', 'roadmap', 'cohort', 'all')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// coupon_redemptions
// ---------------------------------------------------------------------------
export const couponRedemptions = accessSchema.table(
  "coupon_redemptions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }).notNull().defaultNow(),
    ipHash: text("ip_hash"),
  },
  (t) => [uniqueIndex("coupon_redemptions_unique").on(t.couponId, t.userId)],
);

// ---------------------------------------------------------------------------
// grants — the single source of truth for "who can open what"
// ---------------------------------------------------------------------------
export const grants = accessSchema.table(
  "grants",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scopeType: text("scope_type").notNull(),
    scopeCode: text("scope_code"),
    source: text("source").notNull(),
    sourceRef: uuid("source_ref"),
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedReason: text("revoked_reason"),
  },
  (t) => [
    index("grants_user_scope_idx").on(t.userId, t.scopeType, t.scopeCode),
    index("grants_active_idx").on(t.userId).where(sql`${t.revokedAt} IS NULL`),
    check(
      "grants_scope_type_check",
      sql`${t.scopeType} IN ('course', 'roadmap', 'cohort', 'all')`,
    ),
    check("grants_source_check", sql`${t.source} IN ('coupon', 'purchase', 'admin')`),
  ],
);

// ---------------------------------------------------------------------------
// redeem_attempts — rate limiting for coupon guessing
// ---------------------------------------------------------------------------
export const redeemAttempts = accessSchema.table(
  "redeem_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    ipHash: text("ip_hash").notNull(),
    codeHash: text("code_hash").notNull(),
    succeeded: boolean("succeeded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("redeem_attempts_ip_created_idx").on(t.ipHash, t.createdAt),
    index("redeem_attempts_user_created_idx").on(t.userId, t.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// payments — Phase 1a placeholder; real use lands with payments integration
// ---------------------------------------------------------------------------
export const payments = accessSchema.table(
  "payments",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    status: text("status").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeCode: text("scope_code"),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_provider_id_unique").on(t.provider, t.providerPaymentId),
    index("payments_user_id_idx").on(t.userId),
    check(
      "payments_status_check",
      sql`${t.status} IN ('created', 'paid', 'failed', 'refunded')`,
    ),
  ],
);
