# ADR 0003 — CodeMirror 6 for code editing

**Status:** accepted (2026-10-05)

## Context

Learners write code in the browser. We need an editor that:
- Handles 5 languages (JavaScript, TypeScript, Python, Ruby, SQL) plus HTML/CSS for web projects
- Has syntax highlighting, autocomplete, error squiggles
- Works on phones
- Loads fast
- Is small

Candidates:
- CodeMirror 6
- Monaco (the VS Code editor)
- Ace
- Plain `<textarea>` with Prism.js highlighting

## Decision

**CodeMirror 6.**

## Why CodeMirror 6

- **Small.** ~200 KB gzipped for the core + our languages, versus Monaco's ~2 MB.
- **Modular.** Import only what we need. Saves significant bundle size.
- **Tree-shakable.** Unused languages and extensions don't ship.
- **Modern.** Built on a state/view separation model that fits React well.
- **First-class mobile support.** Monaco has historically been poor on touch devices.
- **WASM-friendly.** Works with our browser-run language workers.

## Why not Monaco

- **Bundle size.** Monaco is a full VS Code editor. 2 MB is not worth it.
- **Mobile.** Touch support is poor.
- **Overkill.** Most of Monaco's features (debugging, multi-file projects, git integration) aren't relevant.

Monaco would be right if we were building an IDE. We're building a learning environment.

## Why not Ace

- Ace is fine, but its API is dated and the community momentum is on CodeMirror.
- Fewer language packs available out of the box.

## Why not plain `<textarea>`

- No syntax highlighting.
- No autocompletion.
- No indentation handling.
- No error display.

For a learning tool, the editor is part of the pedagogy.

## Consequences

**Positive:**
- Small bundle (~200 KB gzipped).
- Languages load on demand.
- Consistent behavior across desktop and mobile.
- Composable extensions — we can add "check my code" inline, hover hints, etc.

**Negative:**
- CodeMirror 6's API is more complex than CodeMirror 5's.
- Some integrations (e.g. Emmet) require custom work.
- The `@codemirror/*` package naming is verbose.

## Notes

- The editor lives in `shared/ui/src/editor/CodeEditor.tsx`.
- Language extensions are in `shared/ui/src/editor/languages.ts`.
- Themes: `shared/ui/src/editor/themes.ts` (light + dark, matching the portal).
- The web editor (for HTML/CSS/JS/React projects) lives in `shared/web-editor/`.
