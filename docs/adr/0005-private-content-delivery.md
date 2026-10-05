# ADR 0005 — Content lives in files; served after an access check

**Status:** accepted (2026-10-05)

## Context

Courses, exercises, quizzes, workshops, roadmaps, and problems are the heart of KodxCamp. Where should they live?

Candidates:
- In the database (Postgres rows)
- In files, bundled into the client
- In files, served by an API after an access check
- In a headless CMS (Sanity, Contentful, Strapi)

## Decision

**Content lives as files in `/content/` (a private package in the repo).** It's served through the API after an access check. The API reads from a **private bundle** built at deploy time; the static site ships only a **public bundle** (titles, outlines, landing pages — no lesson bodies or solutions).

## Why files, not the database

- **Version control.** Every change to a lesson is a Git diff. Rollback is trivial.
- **Review.** A PR review shows exactly what changed in the content.
- **No migrations.** Adding a lesson doesn't require a schema change.
- **Fast authoring.** Edit a Markdown file, refresh, done.
- **Portable.** The content doesn't depend on our DB schema.
- **Content is small.** Even 10 courses fit in a few hundred KB.

The database is for **user data** (progress, submissions, sessions), not content.

## Why an access check

- **Paywall.** When courses become paid, content must not be downloadable by non-payers.
- **Scrapers.** A login-gated bundle is harder to scrape than a public one.
- **Correctness.** A learner's progress is keyed to a course; if the course is served without an access check, the UI could show stale/incorrect state.

## Why two bundles

At build time, the content package produces:

- **`content/dist/public/`** — course titles, summaries, module lists, landing pages, syllabus outlines. No lesson bodies. No exercises. No solutions.
- **`content/dist/private/`** — full lesson bodies, exercises, tests, solutions.

The static site ships **only** the public bundle. The Learn server reads the private bundle from disk and serves items only after a grant check.

**Public bundle uses:**
- Catalogs (`/courses`, `/roadmaps`)
- SEO pages (Google indexes course titles and descriptions)
- Landing pages
- Dashboard "continue learning" cards

**Private bundle uses:**
- Lesson body rendering
- Exercise statements, starter files, tests, solutions
- Workshop steps
- Assignment instructions

## Why not a CMS

- **Cost.** Most CMSs charge for private content.
- **Latency.** Extra network round-trip per lesson fetch.
- **Complexity.** Another service to operate.
- **Lock-in.** Migration between CMSs is painful.

We may adopt one for marketing content (blog, announcements) later. Not for learning content.

## Content codes

Every content file has a permanent, unchangeable code (`PY-C0012`, `CRS-PY`, etc.).

**Why:**
- Progress rows in `learn.item_progress` reference `item_code` — a stable key that survives renames.
- Rollback of a content version doesn't lose progress.
- Cross-references (e.g. roadmaps referencing courses) don't break.

Codes are assigned by `new-item.ts` and never reused. Retiring content means setting `status: deprecated`, not deleting the code.

## Consequences

**Positive:**
- Content changes are just commits. Rollback is `git revert`.
- No schema churn.
- Fast authoring.
- Paywall works.
- SEO pages don't require a runtime.

**Negative:**
- Content updates require a deploy. (Trade-off accepted.)
- Two bundles to maintain.
- Content authors must run `pnpm content:validate` before pushing.

## Notes

- Content schema validators: `shared/content-schema/src/*.schema.ts`.
- Build scripts: `content/scripts/build-public-index.ts` and `build-private-bundles.ts`.
- Private bundles are **not** committed (`.gitignore` includes `content/dist/`).
- The Learn server reads `content/dist/private/` from disk at runtime.
