# ADR 0004 — Browser workers with a kill timer for user code

**Status:** accepted (2026-10-05)

## Context

Learners run code in the browser. Code can hang, loop forever, or allocate unbounded memory. We must not freeze the tab.

Candidates:
- Run in the main thread with `eval()` (bad — freezes tab)
- Run in a Web Worker
- Run in an iframe
- Run on the server (rejected — see ADR-0001 context)

## Decision

**Web Worker per run, with a timeout kill and automatic restart.**

Every user code execution:
1. Spawns a fresh Web Worker (or reuses a warm one from a pool).
2. Passes code + stdin via `postMessage`.
3. Starts a timer (`setTimeout` in the main thread).
4. If the timer fires before the worker posts a result: `worker.terminate()`, mark the run as "time limit exceeded", spawn a fresh worker.
5. On result: kill timer, post result to UI, return worker to pool (or terminate).

## Why Web Workers

- **Isolated execution context.** No access to `document`, `window`, cookies, or IndexedDB.
- **Can be killed.** `worker.terminate()` is immediate and reliable.
- **Same-origin by default.** No cross-origin sandbox needed.
- **Can load WASM.** Python and Ruby runtimes are WASM — they fit naturally.

## Why not an iframe

- Iframes can escape through `postMessage` chains.
- Killing an iframe is slower and less reliable.
- WASM loading in iframes is possible but adds complexity.

## Why a timeout, not a memory limit

- The browser doesn't expose per-worker memory limits.
- A hung worker consumes CPU but not unbounded memory in most cases (Python WASM has its own internal limits).
- Time limits catch the "infinite loop" case, which is by far the most common.
- If memory becomes a problem, we can add a heap-usage counter via `performance.measureUserAgentSpecificMemory()` where supported. Deferred.

## Timeout values

| Language | Timeout |
|---|---|
| JavaScript | 5 seconds |
| TypeScript | 5 seconds |
| Python | 10 seconds (WASM startup + run) |
| Ruby | 10 seconds |
| SQL | 3 seconds |

Values are per-language because WASM startup dominates for the non-JS runtimes.

## What "kill" looks like to the learner

The output pane shows:

```
⏱ Time limit exceeded (10 seconds)

Your program didn't finish in time. This usually means an infinite loop
or a very slow algorithm. Click Run again to retry.
```

The Run button stays enabled. The learner can edit and try again.

## Warm-pool strategy (Phase 1b optimization)

Spawning a fresh worker costs 50-200ms. For fast iteration:
- Keep **one** warm worker per language ready.
- On run, use the warm worker; immediately spawn a replacement in the background.
- On kill, discard the worker and start a new one.

This trades memory for latency. Since WASM runtimes are the big cost, we only warm-pool the languages the learner has used recently.

## Consequences

**Positive:**
- The main thread never freezes.
- Infinite loops are always caught.
- Workers can't touch cookies or the DOM.
- Code runs locally — no network latency.

**Negative:**
- Worker startup adds 50-200ms.
- WASM runtimes are 5-15 MB per language (loaded once, cached by the browser).
- Communicating between the editor and the worker requires message passing, which is more code than a direct call.

## Notes

- Worker entry points: `shared/code-runner/src/runtime/languages/<lang>.worker.ts`.
- Worker manager: `shared/code-runner/src/runtime/RunnerManager.ts`.
- Kill timer lives in the manager, not in the worker — a hung worker can't kill itself.
