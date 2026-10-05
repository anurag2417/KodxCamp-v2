-- =============================================================================
-- Enable case-insensitive text for email columns
-- =============================================================================
-- Our schema defines email columns as `text`, but we need case-insensitive
-- comparison at the database level. This migration:
--   1. Enables the citext extension.
--   2. Alters email-typed columns from text to citext.
--
-- Unique indexes on these columns are automatically rebuilt by Postgres when
-- the column type changes.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS citext;

--> statement-breakpoint

ALTER TABLE "auth"."users"
  ALTER COLUMN "email" TYPE citext;

--> statement-breakpoint

ALTER TABLE "auth"."email_verification_tokens"
  ALTER COLUMN "email" TYPE citext;

--> statement-breakpoint

ALTER TABLE "auth"."oauth_accounts"
  ALTER COLUMN "provider_email" TYPE citext;
