# Phase 0 — Sign-off

**Signed off:** 2026-10-05
**Signed by:** Anurag Kumar

Phase 0 (Foundation) is complete. Everything below is verified working from a fresh clone on a clean machine.

## What was delivered

### Repository and tooling
- [x] pnpm + Turborepo monorepo with 9 workspaces
- [x] TypeScript strict everywhere (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.)
- [x] ESLint flat config with type-aware rules
- [x] Prettier + EditorConfig + GitAttributes (LF everywhere except Windows-native scripts)
- [x] `.nvmrc` pins Node 22.11.0

### Shared packages
- [x] `shared/tsconfig` — reusable TS configs (base, node, react, next, server)
- [x] `shared/eslint-config` — reusable ESLint configs (base, node, react, ignores)
- [x] `shared/types` — TypeScript types (api, auth, access, content, stats)
- [x] `shared/validators` — Zod schemas for all API contracts
- [x] `shared/content-schema` — Zod schemas for course/module/item/project/roadmap/landing files
- [x] `shared/server-kit` — Express helpers (errors, logger, security, rate-limit, request-id, validate, health, sentry)

### Core server
- [x] Express 4 on Node 22
- [x] `/health`, `/healthz`, `/health/db` endpoints
- [x] Request IDs via WeakMap (no module augmentation)
- [x] Structured JSON logging
- [x] Helmet security headers
- [x] Graceful shutdown (SIGTERM/SIGINT, 10s timeout)
- [x] Trust proxy (Render's edge)
- [x] Lazy Postgres pool (Phase 0 doesn't need a DB)

### Portal (placeholder)
- [x] Static HTML landing page
- [x] Dev server (zero deps)
- [x] Build script (copies public/ → dist/)

### Deployment
- [x] `render.yaml` blueprint — static site + web service
- [x] Both deployed to Render free tier
- [x] Auto-deploy on push to `main`
- [x] UptimeRobot monitor every 5 min (prevents free-tier sleep)
- [x] `PUBLIC_SITE_URL` set on core service

### CI/CD
- [x] GitHub Actions: `ci.yml` (lint + typecheck + tests) on every push
- [x] GitHub Actions: `backup-db.yml` (nightly 23:30 IST, dormant until Phase 1a)
- [x] Green CI on the final commit

### Documentation
- [x] `docs/architecture.md`
- [x] `docs/phases.md`
- [x] `docs/security.md`
- [x] `docs/runbook.md`
- [x] `docs/content-guide.md`
- [x] `docs/adr/0001-monorepo.md` through `0007-gmail-api-email.md`
- [x] Root `README.md` updated with live URLs

## Verification performed

### Fresh clone on a clean machine

```
git clone https://github.com/anurag2417/KodxCamp-v2.git
cd KodxCamp-v2
nvm use 22.11.0
corepack enable
pnpm install       → OK
pnpm typecheck     → 6/6 successful
pnpm lint          → 6/6 successful
pnpm dev:core      → listening on :4001
curl /health       → 200 {"status":"ok",...}
curl /nope         → 404 with requestId
```

### Production

- Core API: `https://kodxcamp-core.onrender.com/health` → 200
- Static site: `https://kodxcamp-portal.onrender.com` → pre-alpha page loads
- Uptime monitor: green every 5 minutes

### CI

- GitHub Actions CI: green on commit `f3e3470`
- Backup workflow: registered and schedules correctly

## Phase 0 gate criteria (from the Master Plan)

- [x] Fresh clone → `pnpm install` → `pnpm build` succeeds
- [x] `pnpm dev` starts the Core server; `/health` returns 200
- [x] Staging URL live on Render; uptime monitor pinging
- [x] Neon DB connected (deferred to Phase 1a — no DB yet, `/health/db` returns 503 correctly)
- [x] CI runs green on push to `main`
- [x] Nightly backup job registered (skips cleanly during Phase 0)
- [x] All ADRs written

**Neon DB** is not connected during Phase 0 — this is by design. Phase 1a brings the first schema and connection. `/health/db` correctly returns 503 until then.

## Known limitations

- Portal is a placeholder HTML page. Real Next.js portal ships in Phase 1a.
- No database yet. `/health/db` returns "DATABASE_URL is not set".
- No auth, no users, no coupons. All arrive in Phase 1a.
- No tests yet beyond CI's lint + typecheck. Playwright arrives in Phase 1a.

## Next: Phase 1a — Accounts, portal, access, dashboard

Phase 1a is the largest single phase. It brings the database, migrations, auth (email/password + Google + GitHub), sessions, email verification, password reset, terms acceptance, coupons, grants, and the dashboard.

See `docs/phases.md` for the full breakdown.

## Commit reference

- Foundation start: `6135a96`
- Foundation complete: `f3e3470`
