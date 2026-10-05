import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth.ts";

/**
 * core schema — snippets, waitlist, feedback, preferences, feature flags,
 * audit log. Cross-cutting concerns not tied to any single product.
 */

export const coreSchema = pgSchema("core");

// ---------------------------------------------------------------------------
// snippets — saved code from the public compiler
// ---------------------------------------------------------------------------
export const snippets = coreSchema.table(
  "snippets",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    shortId: text("short_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    language: text("language").notNull(),
    title: text("title"),
    code: text("code").notNull(),
    stdin: text("stdin"),
    visibility: text("visibility").notNull().default("unlisted"),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("snippets_short_id_unique").on(t.shortId),
    index("snippets_user_updated_idx").on(t.userId, t.updatedAt),
    check(
      "snippets_language_check",
      sql`${t.language} IN ('javascript', 'typescript', 'python', 'ruby', 'sql')`,
    ),
    check("snippets_visibility_check", sql`${t.visibility} IN ('private', 'unlisted')`),
  ],
);

// ---------------------------------------------------------------------------
// waitlist_entries — for Live classes (Phase 3)
// ---------------------------------------------------------------------------
export const waitlistEntries = coreSchema.table(
  "waitlist_entries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("waitlist_entries_unique").on(t.userId, t.topic),
    check("waitlist_entries_topic_check", sql`${t.topic} IN ('live_classes')`),
  ],
);

// ---------------------------------------------------------------------------
// feedback_reports — "report a problem" button
// ---------------------------------------------------------------------------
export const feedbackReports = coreSchema.table(
  "feedback_reports",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    contentCode: text("content_code"),
    pageUrl: text("page_url").notNull(),
    category: text("category").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("feedback_reports_status_created_idx").on(t.status, t.createdAt),
    index("feedback_reports_content_code_idx").on(t.contentCode),
    check(
      "feedback_reports_category_check",
      sql`${t.category} IN ('bug', 'content_error', 'suggestion', 'other')`,
    ),
    check(
      "feedback_reports_status_check",
      sql`${t.status} IN ('new', 'seen', 'resolved')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// user_preferences
// ---------------------------------------------------------------------------
export const userPreferences = coreSchema.table("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  weeklyDigestEnabled: boolean("weekly_digest_enabled").notNull().default(true),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  digestPausedAt: timestamp("digest_paused_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// feature_flags — runtime-changeable behavior
// ---------------------------------------------------------------------------
export const featureFlags = coreSchema.table("feature_flags", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// audit_log — admin and security actions
// ---------------------------------------------------------------------------
export const auditLog = coreSchema.table(
  "audit_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    meta: jsonb("meta"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_log_actor_created_idx").on(t.actorUserId, t.createdAt),
    index("audit_log_action_created_idx").on(t.action, t.createdAt),
  ],
);
