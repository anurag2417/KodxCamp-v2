# Phases

The build order, what each phase delivers, and what "done" means for each.

Phase tags: **P0** foundation, **P1a** accounts and portal, **P1b** public compiler, **P1c** Learn, **P2** Practice, **P3** Live.

## Phase 0 — Foundation

**Status:** in progress (nearly done).
**Goal:** the repo exists, tooling works, CI runs, deploys succeed, health checks pass.

### Delivered

- [x] pnpm + Turborepo monorepo with TypeScript strict everywhere
- [x] Shared packages: `tsconfig`, `eslint-config`, `types`, `validators`, `content-schema`, `server-kit`
- [x] Core server skeleton with `/health`, `/healthz`, `/health/db`
- [x] Static site placeholder
- [x] `render.yaml` deploy blueprint
- [x] GitHub Actions: CI (lint + typecheck), nightly DB backup (dormant)
- [x] Live URLs on Render
- [x] Uptime monitor keeping the service warm

### Not yet done

- [ ] Documentation (this file, ADRs) — in progress
- [ ] `scripts/check-env.ts`, `backup-db.sh`, `restore-db.sh`
- [ ] `e2e/` Playwright skeleton
- [ ] Nightly backup verified once

### Done when

A stranger can clone the repo, run `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm dev:core`, curl `localhost:4001/health`, and get a 200 — and the same code is deployed live with health checks passing.

## Phase 1a — Accounts, portal, access, dashboard

**Goal:** a stranger can register, accept terms, verify email, redeem a coupon, and see a dashboard. Nothing teaches yet — but the login/access machinery is real.

### Delivered

- Database migrations (`auth`, `access`, `core`, `stats` schemas)
- Auth: register, login (email/password), Google, GitHub OAuth
- Sessions with refresh tokens in HTTP-only cookies
- Email verification, password reset
- Terms + privacy acceptance, versioned
- Admin role, admin pages for coupons and users
- Coupon creation and redemption
- Grants (who can open what)
- Dashboard (`/dashboard`) with profile, access list, coupon box
- Landing page system for courses/roadmaps
- Report a problem button
- Classes waitlist
- Email via Gmail API
- Analytics events
- Sentry error reporting
- Rate limits and captcha
- Playwright E2E for auth flows

### Done when

A stranger registers, verifies email, redeems a coupon, and sees the dashboard — all through the production URL. Admin creates a coupon; user redeems it; grant exists in the DB.

## Phase 1b — Public compiler

**Goal:** anyone can open the compiler, write code, and run it — in any of 5 languages.

### Delivered

- Compiler page (`/compiler`)
- Language runtimes: JavaScript, TypeScript, Python, Ruby, SQL (WASM/workers)
- Stop button, timeout kill, worker restart
- Save snippet (login-gated), share by link
- Settings: font size, theme, keyboard shortcuts
- SQL mode with in-browser database
- Run gate: hard (always ask) or soft (N free runs)
- Code preserved through login via localStorage

### Done when

All 5 languages run hello-world correctly in the browser. Hitting Run while logged out prompts login and restores code after. Snippets save and share. A test file with an infinite loop gets killed after the timeout.

## Phase 1c — Learn

**Goal:** a learner can take a full course: read theory, write code, submit, get feedback, earn XP, keep a streak.

### Delivered

- Content system: files, codes, build pipeline, validation
- Learn Python course (complete)
- Roadmap: Python for beginners
- Lesson pages: theory, coding, quiz, review, workshop, assignment
- Progress saving (browser-first, sync to server)
- XP, streaks
- Weekly progress email (Gmail API)
- Workshop steps with carries-over code
- Assignment checks
- Lesson feedback (thumbs up/down)
- Report a problem button
- Nightly backup verified

### Done when

A test user completes module 1 of Learn Python end to end. XP is awarded exactly once per item. The weekly email arrives. Workshop code persists across sessions.

## Phase 2 — Practice

**Goal:** a bank of DSA and SQL problems, plus projects.

### Delivered

- Problem bank (DSA + SQL) with difficulty ratings
- In-browser judging with verdicts
- Practice rating (avg of best 10 solves)
- Submission history per problem
- SQL datasets
- Projects page with course-linked and standalone projects
- Search-friendly problem pages (SSR-friendly preview)
- Rating progress chart

### Done when

A user solves 5 problems, sees their rating appear, gets suggestions 100-200 above it, and can browse their submission history.

## Phase 3 — Live

**Goal:** cohorts with a teacher, schedule, and attendance.

### Delivered

- Cohort + batch + session models
- Enrollment (by coupon or purchase)
- Attendance marking
- Instructor role
- Admin pages to schedule
- Join-class button on dashboard

### Done when

An instructor creates a cohort with 3 sessions; a student enrolls; the join link works; attendance is recorded.

## Later (not in the first release)

- Java + server-side execution on a paid sandbox
- Payments built into the site (before that: Razorpay Payment Links + manual grants)
- Certificates with verification page
- AI help, step viewer
- Star ratings, learner counts (once real)
- Parental consent flow (if legal advice calls for it)
- Mobile app, leaderboards

## Build order (rules)

1. **Finish a phase completely before starting the next.** No half-products.
2. **Every phase ends with a live deploy.** If it doesn't work in production, it doesn't count.
3. **Every phase ends with documentation updates** to this file and `architecture.md`.
4. **Every phase adds tests.** E2E smoke test for the phase's flagship flow.
5. **No feature branches for phases.** Work on `main`, commit often, push often. Render auto-deploys.
