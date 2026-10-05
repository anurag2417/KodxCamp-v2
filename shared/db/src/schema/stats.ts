import { sql } from "drizzle-orm";
import {
  bigserial,
  check,
  date,
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
 * stats schema — XP, streaks, activity events, email log, weekly digest runs.
 *
 * Design: activity_events is a log-style table (source of truth for XP);
 * user_stats is a cached aggregate updated in the same transaction as each
 * event. Every server may insert into activity_events through shared/stats.
 */

export const statsSchema = pgSchema("stats");

// ---------------------------------------------------------------------------
// activity_events — one row per XP-earning action
// ---------------------------------------------------------------------------
export const activityEvents = statsSchema.table(
  "activity_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    contentCode: text("content_code").notNull(),
    xp: integer("xp").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    localDate: date("local_date").notNull(),
  },
  (t) => [
    uniqueIndex("activity_events_unique").on(t.userId, t.eventType, t.contentCode),
    index("activity_events_user_occurred_idx").on(t.userId, t.occurredAt),
    index("activity_events_user_local_date_idx").on(t.userId, t.localDate),
    check(
      "activity_events_event_type_check",
      sql`${t.eventType} IN (
        'theory_done', 'review_done', 'quiz_passed', 'exercise_passed',
        'workshop_step_passed', 'workshop_done', 'assignment_done', 'problem_solved'
      )`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// user_stats — cached aggregates
// ---------------------------------------------------------------------------
export const userStats = statsSchema.table("user_stats", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  solvedCount: integer("solved_count").notNull().default(0),
  practiceRating: integer("practice_rating"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// email_log — every send is recorded; uniqueness prevents double-sends
// ---------------------------------------------------------------------------
export const emailLog = statsSchema.table(
  "email_log",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    kind: text("kind").notNull(),
    periodKey: text("period_key").notNull(),
    status: text("status").notNull(),
    providerMessageId: text("provider_message_id"),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("email_log_unique").on(t.userId, t.kind, t.periodKey),
    index("email_log_kind_created_idx").on(t.kind, t.createdAt),
    index("email_log_status_created_idx").on(t.status, t.createdAt),
    check(
      "email_log_kind_check",
      sql`${t.kind} IN (
        'verify_email', 'reset_password', 'email_change',
        'account_deleted', 'weekly_digest'
      )`,
    ),
    check(
      "email_log_status_check",
      sql`${t.status} IN ('queued', 'sent', 'failed', 'skipped')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// weekly_digest_runs — one row per week's digest job
// ---------------------------------------------------------------------------
export const weeklyDigestRuns = statsSchema.table(
  "weekly_digest_runs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    weekKey: text("week_key").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    sentCount: integer("sent_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    skippedCount: integer("skipped_count").notNull().default(0),
  },
  (t) => [uniqueIndex("weekly_digest_runs_week_unique").on(t.weekKey)],
);
