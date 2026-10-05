CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "access";
--> statement-breakpoint
CREATE SCHEMA "core";
--> statement-breakpoint
CREATE SCHEMA "stats";
--> statement-breakpoint
CREATE TABLE "auth"."auth_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"email_hash" text,
	"ip_hash" text NOT NULL,
	"succeeded" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_attempts_kind_check" CHECK ("auth"."auth_attempts"."kind" IN ('login', 'register', 'forgot_password', 'verify_resend'))
);
--> statement-breakpoint
CREATE TABLE "auth"."email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"provider_email" text,
	"provider_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_accounts_provider_check" CHECK ("auth"."oauth_accounts"."provider" IN ('google', 'github'))
);
--> statement-breakpoint
CREATE TABLE "auth"."password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"family_id" uuid NOT NULL,
	"user_agent" text,
	"ip_hash" text,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"replaced_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."user_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"doc_type" text NOT NULL,
	"doc_version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	CONSTRAINT "user_consents_doc_type_check" CHECK ("auth"."user_consents"."doc_type" IN ('terms', 'privacy'))
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"password_hash" text,
	"name" text NOT NULL,
	"avatar_url" text,
	"role" text DEFAULT 'student' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_role_check" CHECK ("auth"."users"."role" IN ('student', 'instructor', 'admin')),
	CONSTRAINT "users_status_check" CHECK ("auth"."users"."status" IN ('active', 'pending_terms', 'disabled'))
);
--> statement-breakpoint
CREATE TABLE "access"."coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text
);
--> statement-breakpoint
CREATE TABLE "access"."coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"scope_type" text NOT NULL,
	"scope_code" text,
	"max_redemptions" integer,
	"redeemed_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"grant_duration_days" integer,
	"campaign" text,
	"note" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_scope_type_check" CHECK ("access"."coupons"."scope_type" IN ('course', 'roadmap', 'cohort', 'all'))
);
--> statement-breakpoint
CREATE TABLE "access"."grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scope_type" text NOT NULL,
	"scope_code" text,
	"source" text NOT NULL,
	"source_ref" uuid,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	CONSTRAINT "grants_scope_type_check" CHECK ("access"."grants"."scope_type" IN ('course', 'roadmap', 'cohort', 'all')),
	CONSTRAINT "grants_source_check" CHECK ("access"."grants"."source" IN ('coupon', 'purchase', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "access"."payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"provider" text NOT NULL,
	"provider_payment_id" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" text NOT NULL,
	"scope_type" text NOT NULL,
	"scope_code" text,
	"coupon_id" uuid,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_status_check" CHECK ("access"."payments"."status" IN ('created', 'paid', 'failed', 'refunded'))
);
--> statement-breakpoint
CREATE TABLE "access"."redeem_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"ip_hash" text NOT NULL,
	"code_hash" text NOT NULL,
	"succeeded" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"meta" jsonb,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."feature_flags" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."feedback_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"content_code" text,
	"page_url" text NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_reports_category_check" CHECK ("core"."feedback_reports"."category" IN ('bug', 'content_error', 'suggestion', 'other')),
	CONSTRAINT "feedback_reports_status_check" CHECK ("core"."feedback_reports"."status" IN ('new', 'seen', 'resolved'))
);
--> statement-breakpoint
CREATE TABLE "core"."snippets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"language" text NOT NULL,
	"title" text,
	"code" text NOT NULL,
	"stdin" text,
	"visibility" text DEFAULT 'unlisted' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snippets_language_check" CHECK ("core"."snippets"."language" IN ('javascript', 'typescript', 'python', 'ruby', 'sql')),
	CONSTRAINT "snippets_visibility_check" CHECK ("core"."snippets"."visibility" IN ('private', 'unlisted'))
);
--> statement-breakpoint
CREATE TABLE "core"."user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"weekly_digest_enabled" boolean DEFAULT true NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"digest_paused_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_entries_topic_check" CHECK ("core"."waitlist_entries"."topic" IN ('live_classes'))
);
--> statement-breakpoint
CREATE TABLE "stats"."activity_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"content_code" text NOT NULL,
	"xp" integer NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"local_date" date NOT NULL,
	CONSTRAINT "activity_events_event_type_check" CHECK ("stats"."activity_events"."event_type" IN (
        'theory_done', 'review_done', 'quiz_passed', 'exercise_passed',
        'workshop_step_passed', 'workshop_done', 'assignment_done', 'problem_solved'
      ))
);
--> statement-breakpoint
CREATE TABLE "stats"."email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"kind" text NOT NULL,
	"period_key" text NOT NULL,
	"status" text NOT NULL,
	"provider_message_id" text,
	"error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_log_kind_check" CHECK ("stats"."email_log"."kind" IN (
        'verify_email', 'reset_password', 'email_change',
        'account_deleted', 'weekly_digest'
      )),
	CONSTRAINT "email_log_status_check" CHECK ("stats"."email_log"."status" IN ('queued', 'sent', 'failed', 'skipped'))
);
--> statement-breakpoint
CREATE TABLE "stats"."user_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"solved_count" integer DEFAULT 0 NOT NULL,
	"practice_rating" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats"."weekly_digest_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_key" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_consents" ADD CONSTRAINT "user_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "access"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."coupons" ADD CONSTRAINT "coupons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."grants" ADD CONSTRAINT "grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."grants" ADD CONSTRAINT "grants_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."payments" ADD CONSTRAINT "payments_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "access"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."redeem_attempts" ADD CONSTRAINT "redeem_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."feedback_reports" ADD CONSTRAINT "feedback_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."snippets" ADD CONSTRAINT "snippets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."waitlist_entries" ADD CONSTRAINT "waitlist_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats"."activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats"."email_log" ADD CONSTRAINT "email_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats"."user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_attempts_email_created_idx" ON "auth"."auth_attempts" USING btree ("email_hash","created_at");--> statement-breakpoint
CREATE INDEX "auth_attempts_ip_created_idx" ON "auth"."auth_attempts" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_tokens_hash_unique" ON "auth"."email_verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_id_idx" ON "auth"."email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_user_unique" ON "auth"."oauth_accounts" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "oauth_accounts_user_id_idx" ON "auth"."oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_unique" ON "auth"."password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "auth"."password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "auth"."sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_family_id_idx" ON "auth"."sessions" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "auth"."sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_consents_unique" ON "auth"."user_consents" USING btree ("user_id","doc_type","doc_version");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "auth"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "auth"."users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemptions_unique" ON "access"."coupon_redemptions" USING btree ("coupon_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_unique" ON "access"."coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_campaign_idx" ON "access"."coupons" USING btree ("campaign");--> statement-breakpoint
CREATE INDEX "coupons_scope_idx" ON "access"."coupons" USING btree ("scope_type","scope_code");--> statement-breakpoint
CREATE INDEX "grants_user_scope_idx" ON "access"."grants" USING btree ("user_id","scope_type","scope_code");--> statement-breakpoint
CREATE INDEX "grants_active_idx" ON "access"."grants" USING btree ("user_id") WHERE "access"."grants"."revoked_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_id_unique" ON "access"."payments" USING btree ("provider","provider_payment_id");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "access"."payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "redeem_attempts_ip_created_idx" ON "access"."redeem_attempts" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "redeem_attempts_user_created_idx" ON "access"."redeem_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_actor_created_idx" ON "core"."audit_log" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_action_created_idx" ON "core"."audit_log" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "feedback_reports_status_created_idx" ON "core"."feedback_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "feedback_reports_content_code_idx" ON "core"."feedback_reports" USING btree ("content_code");--> statement-breakpoint
CREATE UNIQUE INDEX "snippets_short_id_unique" ON "core"."snippets" USING btree ("short_id");--> statement-breakpoint
CREATE INDEX "snippets_user_updated_idx" ON "core"."snippets" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_unique" ON "core"."waitlist_entries" USING btree ("user_id","topic");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_events_unique" ON "stats"."activity_events" USING btree ("user_id","event_type","content_code");--> statement-breakpoint
CREATE INDEX "activity_events_user_occurred_idx" ON "stats"."activity_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "activity_events_user_local_date_idx" ON "stats"."activity_events" USING btree ("user_id","local_date");--> statement-breakpoint
CREATE UNIQUE INDEX "email_log_unique" ON "stats"."email_log" USING btree ("user_id","kind","period_key");--> statement-breakpoint
CREATE INDEX "email_log_kind_created_idx" ON "stats"."email_log" USING btree ("kind","created_at");--> statement-breakpoint
CREATE INDEX "email_log_status_created_idx" ON "stats"."email_log" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_digest_runs_week_unique" ON "stats"."weekly_digest_runs" USING btree ("week_key");