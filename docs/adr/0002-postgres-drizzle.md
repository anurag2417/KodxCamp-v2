# ADR 0002 — Postgres + Drizzle, one database, seven schemas

**Status:** accepted (2026-10-05)

## Context

We need a database. Candidates:
- Postgres (via Neon, Supabase, self-hosted)
- MySQL
- MongoDB
- SQLite

And an ORM / query builder:
- Prisma
- Drizzle
- Kysely
- Raw SQL + a thin wrapper

## Decision

**Postgres on Neon, managed with Drizzle ORM.** One database, seven schemas (`auth`, `access`, `core`, `stats`, `learn`, `practice`, `live`).

## Why Postgres

- Strong typing (real types, not just runtime coercion).
- Excellent JSON support (`jsonb`) for the few places we need it (workshop files, quiz answers).
- `citext` for case-insensitive email.
- Row-level security available if we ever want it.
- Neon's free tier is generous: 0.5 GB storage, scales to zero, branching.

## Why Neon

- **Free tier that doesn't expire.** (Heroku Postgres's free tier did. PlanetScale killed theirs.)
- **Scale-to-zero compute.** When idle, we pay nothing.
- **Branching.** Point-in-time-copy of the whole DB for testing migrations.
- **Managed backups** (we still keep our own via `pg_dump`).
- **Good Render integration.**

## Why Drizzle

- **Type-safe SQL.** Schemas produce types; queries infer types.
- **No code generation step** (unlike Prisma's `prisma generate`).
- **Migrations as plain SQL.** Reviewable, editable, portable.
- **Small runtime.** No large client.
- **Works with `pg` (which we already use).**

## Why seven schemas

Logical separation:

| Schema | Owns |
|---|---|
| `auth` | users, sessions, oauth accounts, tokens, consents, attempts |
| `access` | coupons, redemptions, grants, payments |
| `core` | snippets, waitlist, feedback, preferences, flags, audit |
| `stats` | activity events, user stats, email log, digest runs |
| `learn` | enrollments, progress, workshop state, attempts, feedback |
| `practice` | submissions, problem status, snapshots, project status |
| `live` | cohorts, batches, sessions, enrollments, attendance |

Benefits:
- **Per-service users.** Each server gets `CREATE ROLE` with access only to its own schemas + read-only on `access.grants`.
- **Logical backup granularity.** Can dump just `learn` if we ever need to.
- **Clarity.** A glance at a query tells you what part of the system it touches.

## Alternatives considered

### Prisma

- **Pro:** huge ecosystem, great DX, great migrations
- **Con:** needs a codegen step; query engine is a binary; more magic; harder to write raw SQL
- **Rejected** — Drizzle's plain-SQL approach is closer to what we want.

### Kysely

- **Pro:** excellent type safety, plain SQL
- **Con:** no migrations out of the box; schema-as-types instead of schema-as-code
- **Rejected** — Drizzle's migration story is better.

### Mongo

- **Pro:** flexible schemas
- **Con:** no joins, no transactions across collections, less maturity for our use case
- **Rejected** — we have clearly relational data (users → grants → courses).

### One database, one schema

- **Pro:** simpler
- **Con:** no per-service permission boundaries; all-or-nothing access
- **Rejected** — the seven-schema split is our security boundary between services.

## Consequences

**Positive:**
- Type-safe queries without a codegen step.
- Per-service DB users enforce least privilege.
- Neon's scale-to-zero keeps costs at zero when idle.

**Negative:**
- Must remember to run `pnpm db:generate` after changing schema files.
- Must not edit generated migration SQL (always create a new one).
- `pg` is CommonJS — imports need the default-import workaround (see `apps/core/server/src/db/client.ts`).

## Notes

- Drizzle config lives at `shared/db/drizzle.config.ts` (added in Phase 1a).
- Migrations are committed in `shared/db/migrations/`.
- `scripts/seed.ts` creates the first admin user and default feature flags.
