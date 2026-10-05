# Content guide

How to write a course, module, item, or problem for KodxCamp. Every piece of content is a file in `/content/`, committed to Git.

## Philosophy

- **Reading is not learning.** Every concept gets an exercise or a workshop.
- **Short is better.** Theory items over 500 words should be split or trimmed.
- **Errors are teaching moments.** When a learner's code breaks, the error message should be actionable.
- **Hints, not answers.** A hint should nudge, not solve.
- **Permanent codes.** Once a code ships, it never changes. Content moves and renames; codes are the anchor.

## Content codes

Every piece of content has an unchangeable code, written into its file metadata.

| Content | Pattern | Example |
|---|---|---|
| Course | `CRS-<PREFIX>` | `CRS-PY` |
| Module | `<PREFIX>-M<NNN>` | `PY-M003` |
| Item | `<PREFIX>-<TYPE><NNNN>` | `PY-C0012` |
| Workshop step | `<workshop code>.S<NN>` | `PY-W0003.S05` |
| Problem | `PRB-<NNNNN>` | `PRB-00231` |
| Project | `PRJ-<NNNN>` | `PRJ-0007` |
| Practice set | `PSET-<NNNN>` | `PSET-0002` |
| Roadmap | `RDM-<NNNN>` | `RDM-0001` |
| Landing page | `LND-<NNNN>` | `LND-0004` |
| Cohort | `COH-<NNNN>` | `COH-0001` |

Type letters: `T` theory, `C` coding, `Q` quiz, `R` review, `W` workshop, `A` assignment.

## Directory layout

```
content/
├── courses/
│   └── python/
│       ├── course.json
│       ├── landing.json
│       └── modules/
│           ├── 01-getting-started/
│           │   ├── module.json
│           │   ├── 01-what-is-python.theory.mdx
│           │   ├── 02-first-program.coding/
│           │   │   ├── exercise.json
│           │   │   ├── statement.mdx
│           │   │   ├── starter.py
│           │   │   ├── solution.py
│           │   │   └── tests/
│           │   │       ├── case-01.in
│           │   │       ├── case-01.out
│           │   │       ├── case-02.in
│           │   │       └── case-02.out
│           │   ├── 03-getting-started-quiz.quiz.json
│           │   └── 04-recap.review.mdx
│           └── 02-variables/
├── roadmaps/
│   └── python-beginner/
│       ├── roadmap.json
│       └── landing.json
├── problems/
├── projects/
├── practice-sets/
├── datasets/
├── legal/
│   ├── legal.json
│   ├── terms/v1.mdx
│   └── privacy/v1.mdx
└── scripts/
    ├── validate.ts
    ├── build-public-index.ts
    ├── build-private-bundles.ts
    ├── test-solutions.ts
    ├── new-item.ts
    ├── new-course-from-outline.ts
    ├── check-codes.ts
    └── dev.ts
```

## File formats

### `course.json`

```json
{
  "code": "CRS-PY",
  "slug": "python",
  "title": "Learn Python",
  "summary": "Start from zero and write real Python programs.",
  "level": "beginner",
  "category": "programming",
  "tags": ["python", "basics"],
  "language": "python",
  "featured": true,
  "estimatedHours": 20,
  "moduleOrder": ["PY-M001", "PY-M002"],
  "status": "published",
  "updatedAt": "2026-10-01"
}
```

### `module.json`

```json
{
  "code": "PY-M001",
  "title": "Getting started",
  "summary": "Your first taste of Python.",
  "itemOrder": ["PY-T0001", "PY-C0002", "PY-Q0003", "PY-R0004"],
  "status": "published"
}
```

### Theory / review (`.mdx` with a header)

```
---
code: PY-T0001
title: What is Python
type: theory
estMinutes: 8
status: published
---

Text, code samples, and callouts go here.

::: note
Callout boxes support `note`, `warn`, `tip`, and `danger`.
:::
```

### `exercise.json` (with `statement.mdx`, `starter.py`, `solution.py`, `tests/`)

```json
{
  "code": "PY-C0002",
  "title": "Your first program",
  "type": "coding",
  "language": "python",
  "timeLimitMs": 2000,
  "hints": ["Use print().", "Text goes inside quotes."],
  "cases": [
    { "in": "tests/case-01.in", "out": "tests/case-01.out", "hidden": false },
    { "in": "tests/case-02.in", "out": "tests/case-02.out", "hidden": true }
  ]
}
```

### `quiz.json`

```json
{
  "code": "PY-Q0003",
  "title": "Getting started quiz",
  "type": "quiz",
  "passMark": 70,
  "questions": [
    {
      "id": "q1",
      "prompt": "Which prints text?",
      "options": ["print()", "echo()", "say()"],
      "answerIndex": 0,
      "explanation": "print() writes to the output."
    }
  ]
}
```

### Workshop

`workshop.json` + `steps/NN.mdx`:

```json
{
  "code": "HTML-W0001",
  "title": "Build a curriculum outline",
  "type": "workshop",
  "template": "vanilla",
  "libraries": [],
  "files": { "index.html": "<!-- start here -->" },
  "steps": [
    {
      "code": "HTML-W0001.S01",
      "title": "Add a heading",
      "instruction": "steps/01.mdx",
      "checks": [{ "type": "element-exists", "selector": "h1" }]
    }
  ]
}
```

### Assignment

```json
{
  "code": "HTML-A0002",
  "title": "Debug the profile page",
  "type": "assignment",
  "template": "vanilla",
  "libraries": ["bootstrap"],
  "estMinutes": 25,
  "starterFiles": ["index.html", "styles.css"],
  "requirements": [
    {
      "id": "r1",
      "text": "The page has one h1 with the name",
      "check": { "type": "element-count", "selector": "h1", "equals": 1 }
    }
  ]
}
```

### Check types

- `element-exists` — selector matches at least one element
- `element-count` — selector matches exactly N
- `text-equals` — element's text content equals a string
- `text-contains` — element's text contains a string
- `attribute-equals` — element has attribute with value
- `style-equals` — computed style property has value
- `js` — arbitrary JS expression (`{"type": "js", "expr": "..."}`)

### Roadmap

```json
{
  "code": "RDM-0001",
  "slug": "python-beginner",
  "title": "Python for beginners",
  "summary": "Everything you need to get comfortable with Python.",
  "levels": [
    {
      "title": "Learn Python",
      "items": [{ "type": "course", "code": "CRS-PY" }]
    },
    {
      "title": "Practice",
      "items": [{ "type": "practice-set", "code": "PSET-0001" }]
    }
  ],
  "status": "published"
}
```

### Landing page

```json
{
  "code": "LND-0001",
  "target": { "type": "course", "code": "CRS-PY" },
  "seo": {
    "title": "Learn Python",
    "description": "Learn Python by doing.",
    "ogImage": "og/python.png"
  },
  "sections": [
    { "type": "hero", "headline": "Learn Python by doing", "sub": "...", "cta": "Redeem a code" },
    { "type": "outcomes", "items": ["Write programs", "Read errors", "Solve problems"] },
    { "type": "syllabus", "auto": true },
    { "type": "stats", "items": ["lessons", "hours"] },
    { "type": "instructor", "name": "...", "bio": "..." },
    { "type": "faq", "items": [{ "q": "Is it free?", "a": "..." }] },
    { "type": "couponBox" }
  ]
}
```

## Workflow

### Creating a new item

```bash
pnpm --filter @kodxcamp/content new-item --type coding --course PY --title "Your first program"
```

This creates a folder with the next available code (e.g. `PY-C0013`), `exercise.json`, `statement.mdx`, `starter.py`, and `solution.py`.

### Creating a whole course

```bash
pnpm --filter @kodxcamp/content new-course --outline content/_templates/outline.template.yaml
```

YAML outline:
```yaml
course: { prefix: PY, slug: python, title: Learn Python, level: beginner }
modules:
  - title: Getting started
    items:
      - { type: theory, title: What is Python }
      - { type: coding, title: Your first program }
      - { type: quiz, title: Getting started quiz }
```

Generates the entire skeleton with codes assigned.

### Local preview

```bash
pnpm --filter @kodxcamp/content dev
```

Serves any lesson on `http://localhost:5000` exactly as a learner would see it — no login, no backend. Instant feedback.

### Validating

```bash
pnpm content:validate
```

Fails the build if:
- Any file is malformed
- Any code is missing or duplicated
- Any previously shipped code disappeared
- Any solution doesn't pass its own tests

**This runs in CI on every push.** Broken content cannot reach production.

## Writing style

- **Voice:** second person, present tense. "You write a program." Not "The learner will write a program."
- **Sentences:** short. One idea each.
- **Code:** every block is runnable. No pseudo-code.
- **Errors:** name them. Show them. Show how to fix them.
- **Hints:** 2-3 per exercise. Each should push toward the answer without giving it.

## Anti-patterns

- **Too much theory.** If a lesson has no exercise, delete it or merge it into another.
- **Copy-paste exercises.** Every exercise should test a different skill.
- **Tricky checks.** The check tests the concept, not esoteric edge cases.
- **Answers in statements.** The learner should have to think.
- **Undocumented codes.** Every item's code is in its metadata file, visible to tooling.

## The first course

**Learn Python** is the template for every course that follows. Build it first, completely, before touching anything else. Its patterns become the standard.
