import type { ErrorRequestHandler } from "express";

import { logger } from "./logger.js";
import { getRequestId } from "./request-id.js";

/**
 * Minimal Sentry integration stub.
 *
 * Right now this is a pass-through that logs to our structured logger. When
 * Phase 1a installs @sentry/node, this file becomes the single seam where
 * errors are forwarded to Sentry — no other file changes.
 *
 * If SENTRY_DSN is unset, this is a complete no-op aside from logging.
 */

export interface SentryContext {
  requestId?: string;
  method?: string;
  path?: string;
}

/**
 * Reports an error to Sentry (or, for now, just logs it). Call this from
 * the error handler; do NOT call it from business logic directly.
 */
export function captureError(err: unknown, context: SentryContext = {}): void {
  if (!process.env["SENTRY_DSN"]) {
    // No DSN → no Sentry. Log locally and move on.
    return;
  }
  // Placeholder: the real integration will go here once @sentry/node is
  // installed. Kept as an explicit no-op so callers already have the seam.
  logger.error(
    {
      ...context,
      sentryPlaceholder: true,
      err: err instanceof Error ? { name: err.name, message: err.message } : String(err),
    },
    "captureError called but Sentry is not yet wired",
  );
}

/**
 * Express error middleware that forwards to Sentry and then defers to the
 * normal error handler chain. Register this BEFORE the main error handler
 * if you want Sentry to see errors. Not required — the main error handler
 * can call captureError directly.
 */
export function createSentryErrorMiddleware(): ErrorRequestHandler {
  return (err, req, _res, next) => {
    const requestId = getRequestId(req);
    const context: SentryContext = {
      method: req.method,
      path: req.path,
    };
    if (requestId !== undefined) {
      context.requestId = requestId;
    }
    captureError(err, context);
    next(err);
  };
}
