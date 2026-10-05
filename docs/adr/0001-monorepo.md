C:\kodxcamp-v2\docs\adr\0001-monorepo.md
# ADR 0001 — Monorepo with pnpm workspaces + Turborepo

**Status:** accepted (2026-10-05)

## Context

KodxCamp has multiple related codebases:
- 3+ Express servers (core, learn, practice, live)
- 3+ Vite React clients
- 1 Next.js portal
- 8+ shared packages (types, validators, db, server-kit, etc.)
- 1 content package

Every server needs the shared types and validators. Every client needs the shared UI and auth-client. Every package needs the shared tsconfig and eslint config.

## Decision

**One repository, many workspaces.** `pnpm` handles package linking via `pnpm-workspace.yaml`. Turborepo handles task running and caching via `turbo.json`.

Directory structure:
- `apps/*` — applications (server + client for each product)
- `shared/*` — cross-cutting packages
- `content/` — the private content package
- `e2e/` — Playwright tests

## Alternatives considered

### Polyrepo (multiple repos)

- **Pro:** independent versioning, independent CI
- **Con:** pain to keep shared types in sync; every change to `shared/types` needs a publish + version bump + install in 4 other repos
- **Rejected** — we're one person. Friction kills velocity.

### Nx instead of Turborepo

- **Pro:** more features (affected graph, generators, more plugins)
- **Con:** heavier, more configuration, more magic
- **Rejected** — Turborepo is smaller and does exactly what we need.

### npm/yarn workspaces instead of pnpm

- **Pro:** more ubiquitous
- **Con:** slower installs, less strict dependency isolation
- **Rejected** — pnpm's strict node_modules catches accidental transitive dependency usage, which matters for correctness.

## Consequences

**Positive:**
- One `pnpm install` gets everything.
- Changing `shared/types` is immediately reflected in every consumer.
- One CI pipeline tests everything.
- Atomic commits across the whole stack.

**Negative:**
- Large repo. Fresh clone pulls everything.
- CI must be smart about caching (Turborepo handles this).
- A broken change in one workspace can block another (mitigated by running tasks in parallel via Turbo).

## Notes

- `shared/` packages are consumed as TypeScript source (via `main: ./src/index.ts`) — no build step for shared code during dev.
- Servers bundle the shared source via `tsup` at build time.
- Clients bundle via Vite.
- This is why the whole thing works without a separate "publish shared packages" step.
