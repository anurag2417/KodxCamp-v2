# Architecture

How KodxCamp is put together, and why.

## The one-line summary

TypeScript monorepo. Express services on Render. Postgres on Neon. All frontend code runs in the browser. Content is files, not database rows.

## The system in one diagram

```
        ┌───────────────────────────────────────────────────────────┐
        │                        Browser                            │
        │                                                           │
        │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
        │   │   Portal     │  │  Learn app   │  │   Compiler   │    │
        │   │  (Next.js)   │  │  (Vite React)│  │ (Vite React) │    │
        │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
        │          │                 │                 │            │
        │          │                 │                 │            │
        │          └────────┬────────┴────────┬────────┘            │
        │                   │                 │                     │
        │              [ Same origin: static site + /api rewrite ]  │
        └───────────────────┬─────────────────┬─────────────────────┘
                            │                 │
              ┌─────────────▼──────┐  ┌───────▼──────────┐
              │   Core Server      │  │  Learn Server    │
              │  (Express, Node)   │  │  (Express, Node) │
              │  auth, users,      │  │  lessons,        │
              │  coupons, grants   │  │  progress        │
              └─────────┬──────────┘  └────────┬─────────┘
                        │                      │
                        └──────────┬───────────┘
                                   │
                          ┌────────▼────────┐
                          │  Neon Postgres  │
                          │  (7 schemas)    │
                          └─────────────────┘

        ┌─────────────────────────┐
        │  jsDelivr CDN           │  Python, Ruby runtimes
        │  (browser-side)         │  loaded only when needed
        └─────────────────────────┘

        ┌─────────────────────────┐
        │  Gmail API              │  transactional + digest email
        └─────────────────────────┘
```

## The three products

### Learn

The core learning experience. Courses made of modules, made of items (theory, coding, quiz, review, workshop, assignment). Progress is tracked per item. Access is gated by grants (from coupons or payment).

- **Where:** `apps/learn/` (client + server).
- **Phase:** 1c.
- **Content:** lives in `/content/courses/`, not the database.

### Practice

A bank of DSA and SQL problems with difficulty ratings. Run/Submit require login; code executes in the browser. Also hosts standalone building projects.

- **Where:** `apps/practice/` (client + server).
- **Phase:** 2.
- **Content:** `/content/problems/` and `/content/projects/`.

### Live

Cohort classes taught on Zoom/Meet. Enrollment, attendance, session schedule.

- **Where:** `apps/live/` (client + server).
- **Phase:** 3.
- **Data:** the only product whose primary data lives in the database (`live` schema), not files.

## Cross-cutting products

### Public compiler

A free, login-gated code runner. JavaScript, TypeScript, Python, Ruby, SQL — all in the browser, downloaded on demand.

- **Where:** `apps/portal/` (currently a placeholder) plus shared `code-runner/`.
- **Phase:** 1b.

### Portal

Marketing site, auth flows, dashboard, admin. Static export (Next.js) so it ships as plain HTML/JS.

- **Where:** `apps/portal/`.
- **Phase:** 1a.

## Key architectural decisions

These are the "load-bearing" choices. Each has an ADR in `docs/adr/`.

1. **Monorepo with pnpm workspaces + Turborepo.** (ADR-0001)
2. **Postgres + Drizzle, one database, seven schemas.** (ADR-0002)
3. **CodeMirror 6 for all code editing.** (ADR-0003)
4. **Browser workers with a kill timer for user code.** (ADR-0004)
5. **Content lives in files; the DB stores codes and progress.** (ADR-0005)
6. **Access is grants; coupons and payments both create them.** (ADR-0006)
7. **Gmail API for email, not SMTP.** (ADR-0007)

## The request/response shape

Every API response is one of:

**Success:**
```json
{ "data": { ... } }
```

**Error:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required.",
    "details": { ... },
    "requestId": "uuid"
  }
}
```

Every response carries an `X-Request-Id` header. The same ID is in the body's `error.requestId` field for errors. Logs use the same ID. This is the correlation thread across the whole system.

## Where state lives

| State | Where | Why |
|---|---|---|
| Auth session | HTTP-only secure cookie (refresh token) + in-memory access token | Keeps tokens out of JS-accessible storage |
| Course content | Files in `/content/` in the repo | Versioned with Git; reviewable; no DB migrations for content |
| User progress | `learn` schema in Postgres | Queryable, joinable with `stats`, survives across content revisions |
| Grants (access) | `access.grants` table | Single source of truth for "who can open what" |
| Activity / XP | `stats.activity_events` (log-style) + `stats.user_stats` (cached totals) | Log enables recomputation and audit; cache makes dashboards fast |
| Feature flags | `core.feature_flags` table | Changeable without deploy |
| Compiler snippets | `core.snippets` table | Small; needs sharing by link |

## What runs where

| Component | Runtime | Host |
|---|---|---|
| Portal static build | Browser | Render static site |
| Learn/Practice/Live clients | Browser | Same static site, different subpaths |
| Core server | Node 22 | Render web service |
| Learn server | Node 22 | Render web service (Phase 1c) |
| Practice server | Node 22 | Render web service (Phase 2) |
| Live server | Node 22 | Render web service (Phase 3) |
| Python / Ruby runtimes | Browser (WASM) | Loaded from jsDelivr |
| Database | Postgres 15+ | Neon |
| Email | Google Gmail API | Google |

## What does NOT run server-side

**User-submitted code.** Every exercise, problem, workshop, and compiler run happens in the learner's browser. No server-side sandbox. This is the biggest cost and security decision in the whole project:

- **Cost:** bandwidth to serve Python (a few MB) instead of CPU time per execution. Free tier can absorb it.
- **Security:** arbitrary code never touches our infra. No RCE risk on our servers.
- **Latency:** code runs in ~10ms locally instead of ~500ms round-trip to a server.

The one exception is future Java support, which will require a real sandboxed server. Deferred until ~200 users + revenue (per the Master Plan).

## Free-tier constraints and their workarounds

| Constraint | Workaround |
|---|---|
| Render free services sleep after 15 min idle | UptimeRobot pings `/health` every 5 min |
| Render blocks SMTP outbound | Gmail API over HTTPS |
| `*.onrender.com` sites can't share cookies | API rewrite rule: `/api/*` → core service, same origin |
| Neon free storage is small | Big content in files, not DB |
| Render free bandwidth is limited | WASM runtimes load from jsDelivr, not from our domain |
| Gmail sends 500 emails/day | Transactional first; digest capped at 400/day |

## Directory map (what lives where)

```
apps/
  core/server/       Core API (auth, users, coupons, grants, email)
  portal/            Static site (marketing, auth, dashboard, admin)
  learn/             Courses product (client + server)          [Phase 1c]
  practice/          Problems and projects                       [Phase 2]
  live/              Cohorts                                     [Phase 3]

shared/
  tsconfig/          Reusable TS configs
  eslint-config/     Reusable ESLint flat configs
  types/             Shared TypeScript types
  validators/        Zod schemas for API contracts
  content-schema/    Zod schemas for content files
  db/                Drizzle schema + migrations                 [Phase 1a]
  server-kit/        Express helpers (errors, logging, health)
  auth/              Server-side token + middleware helpers      [Phase 1a]
  auth-client/       Client-side auth context                    [Phase 1a]
  stats/             XP, streaks, activity recording             [Phase 1c]
  analytics/         Typed event tracking                        [Phase 1a]
  ui/                Shared React components + editor            [Phase 1a]
  landing/           Landing page renderer                       [Phase 1a]
  checks/            Check DSL for exercises                     [Phase 1c]
  code-runner/       Browser code execution                      [Phase 1b]
  web-editor/        Multi-file editor with preview              [Phase 1c]

content/             Private courses, roadmaps, problems         [Phase 1c]
e2e/                 Playwright tests                            [Phase 1a]
docs/                This documentation
scripts/             Repo-level tooling
.github/workflows/   CI, backups
```

## How to add a new service

1. Create `apps/<name>/server/` following the pattern in `apps/core/server/`.
2. Copy `package.json`, `tsconfig.json`, `eslint.config.js`, `tsup.config.ts`.
3. Add to `render.yaml` as a new `type: web` service.
4. Add a DB user in `shared/db/scripts/create-db-roles.sql` (in Phase 1a).
5. Add a section to this doc.

## How to add a new shared package

1. Create `shared/<name>/` with `package.json`, `tsconfig.json`, `eslint.config.js`, and `src/index.ts`.
2. The `shared/*` glob in `pnpm-workspace.yaml` picks it up automatically.
3. Add it as a `workspace:*` dependency in any workspace that uses it.
4. Run `pnpm install` at the repo root.
