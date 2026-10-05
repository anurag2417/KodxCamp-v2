# @kodxcamp/core-server

The KodxCamp core HTTP service. Handles authentication, users, coupons, grants, and email. Built on Express 4 + Postgres.

**Status:** Phase 0 — skeleton with health checks only. Business logic lands in Phase 1a.

## Running locally

```bash
# From repo root:
pnpm install
pnpm --filter @kodxcamp/core-server dev
```

Or, with the root convenience script:

```bash
pnpm dev:core
```

The server listens on `http://localhost:4001` by default.

## Environment

Copy `.env.example` to `.env.local` (in this folder) and fill in values. `.env.local` is git-ignored.

See the root `.env.example` for the full list of env vars used across all services.

## Endpoints

| Method | Path         | Purpose                                          |
| ------ | ------------ | ------------------------------------------------ |
| GET    | `/health`    | Liveness. No external dependencies.              |
| GET    | `/healthz`   | Alias for `/health` (Render, k8s convention).    |
| GET    | `/health/db` | Readiness. Pings Postgres. Returns 503 on fail.  |

## Scripts

| Script           | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Hot-reload dev server via `tsx watch`.           |
| `pnpm build`     | Bundle to `dist/index` via `tsup`.            |
| `pnpm start`     | Run the built bundle (production).               |
| `pnpm typecheck` | Type-check without emitting.                     |
| `pnpm lint`      | ESLint flat config.                              |
| `pnpm clean`     | Remove `dist/` and Turborepo cache.              |

## Production notes

- Runs on Node 22.11.0. The `.nvmrc` at the repo root pins this.
- Reads the port from `PORT` (defaults to 4001). Render sets `PORT` automatically.
- Trusts one proxy hop (`app.set("trust proxy", 1)`) — required for correct `req.ip` behind Render's edge.
- Graceful shutdown on `SIGTERM`, with a 10-second timeout.
