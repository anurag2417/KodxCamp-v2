# KodxCamp

Learn programming by doing. A learner reads a short lesson, writes code in the browser, and gets checked immediately. Nothing to install.

**Status:** pre-alpha. Building Phase 0 (foundation). Not yet open to learners.

---

## What's being built

Three sections, all under one web address:

- **Learn** — step-by-step courses (starting with Learn Python), grouped into roadmaps.
- **Practice** — a bank of DSA and SQL problems with difficulty ratings, plus building projects.
- **Live** — cohort classes on Zoom or Google Meet. Built last.

Plus a **free public compiler** where anyone can type and run code in the browser.

All learner code runs inside the visitor's own browser. The site itself doesn't execute user code — that keeps it cheap and safe.

---

## Stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript everywhere |
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js static export (portal) + Vite React apps (Learn, Practice, Live) |
| Backend | Express services on Render |
| Database | Neon Postgres, Drizzle ORM |
| Email | Gmail API (not SMTP) |
| Browser runtimes | JavaScript, TypeScript, Python, Ruby, SQL (loaded from jsDelivr) |
| Hosting | Render (static site + web services) |
| CI/CD | GitHub Actions |

---

## Repository layout

```
kodxcamp/
├── apps/                 Application workspaces
│   ├── portal/           Next.js static site (marketing, auth, dashboard, admin)   [P1a]
│   ├── core/server/      Express: auth, users, coupons, grants, email              [P1a]
│   ├── learn/            Courses product (Vite React client + Express server)      [P1c]
│   ├── practice/         Problems, projects, submissions                           [P2]
│   └── live/             Cohorts, batches, sessions, attendance                    [P3]
│
├── shared/               Cross-workspace packages
│   ├── tsconfig/         Shared TypeScript configs
│   ├── eslint-config/    Shared ESLint configs
│   ├── types/            Shared TypeScript types
│   ├── validators/       Zod schemas for API contracts
│   ├── content-schema/   Zod schemas for content files
│   ├── db/               Drizzle schema + migrations
│   ├── server-kit/       Express helpers: errors, logging, security, health
│   ├── auth/             Server-side token + middleware helpers
│   ├── auth-client/      Client-side auth context + guards
│   ├── stats/            XP, streaks, activity recording
│   ├── analytics/        Typed event tracking
│   ├── ui/               Shared React components + CodeMirror editor
│   ├── landing/          Landing page renderer for courses/roadmaps/cohorts
│   ├── checks/           Check DSL for exercises, workshops, assignments
│   ├── code-runner/      Browser-based code execution
│   └── web-editor/       Multi-file web editor with live preview
│
├── content/              Private content (courses, exercises, roadmaps)
│   ├── courses/          Source of truth for all lessons
│   ├── roadmaps/         Ordered learning paths
│   ├── problems/         Practice problems
│   ├── projects/         Standalone building projects
│   ├── scripts/          Validation, build, and scaffolding tools
│   └── dist/             Build output (git-ignored)
│
├── e2e/                  Playwright end-to-end tests
├── docs/                 Architecture, phases, ADRs, runbook
├── scripts/              Repo-level tooling (backup, restore, static assembly)
└── .github/workflows/    CI, content checks, backups, scheduled jobs
```

Phase tags: **P0** foundation, **P1a** accounts and portal, **P1b** public compiler, **P1c** Learn, **P2** Practice, **P3** Live.

---

## Getting started

### Prerequisites

- **Node** 22.11.0 (see `.nvmrc`)
- **pnpm** 9.15.4 (pinned via `packageManager` in `package.json`)
- **Git** 2.40+
- **nvm-windows** (or nvm on macOS/Linux) recommended

### Setup

```bash
# Use the correct Node version
nvm use

# Enable Corepack (reads packageManager from package.json)
corepack enable

# Install dependencies
pnpm install

# Copy the env template and fill in your local values
cp .env.example .env

# Run the dev servers
pnpm dev
```

### Common commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start all dev servers (Turborepo, parallel) |
| `pnpm build` | Build all workspaces in dependency order |
| `pnpm lint` | Lint every workspace |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm test` | Unit tests in every workspace |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Verify formatting without writing |
| `pnpm clean` | Remove build outputs and caches |
| `pnpm clean:all` | Nuclear: removes all `node_modules` too |

---

## Conventions

- **TypeScript only.** No JavaScript source files.
- **Strict mode.** All strict flags on, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **Content is files.** Courses, exercises, and roadmaps live as files in `content/`, not rows in the database. Every item has a permanent code.
- **Access is grants.** Coupons and payments create grants. Everything gated checks grants.
- **XP is idempotent.** Every XP-earning action is recorded once per user per item.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
- **Line endings** are LF everywhere except Windows-native scripts (`.ps1`, `.bat`, `.cmd`). Enforced by `.editorconfig`, `.gitattributes`, and Prettier.

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system design
- [`docs/phases.md`](docs/phases.md) — phase-by-phase feature breakdown
- [`docs/security.md`](docs/security.md) — auth, sessions, secrets, threat model
- [`docs/runbook.md`](docs/runbook.md) — deployment, backups, incident response
- [`docs/content-guide.md`](docs/content-guide.md) — writing a course, item, or problem
- [`docs/adr/`](docs/adr/) — architecture decision records

---

## License

UNLICENSED. All rights reserved. Private project.
