import type { ErrorRequestHandler, RequestHandler } from "express";

import type { ApiErrorResponse } from "@kodxcamp/types/api";

import { isAppError } from "./app-error.js";
import { logger } from "./logger.js";
import { getRequestId } from "./request-id.js";

/**
 * Final error middleware. Must be registered LAST, after all routes.
 * Express identifies error middleware by the 4-argument signature.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // If the response has already started, defer to Express's default handler
  // — we can't send a JSON body once headers are flushed.
  if (res.headersSent) {
    next(err);
    return;
  }

  const requestId = getRequestId(req);

  if (isAppError(err)) {
    const body: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
        ...(requestId !== undefined ? { requestId } : {}),
      },
    };
    // 4xx → warn, 5xx → error. Keeps log noise proportional to severity.
    const logMeta = {
      requestId,
      code: err.code,
      status: err.status,
      method: req.method,
      path: req.path,
    };
    if (err.status >= 500) {
      logger.error(logMeta, err.message);
    } else {
      logger.warn(logMeta, err.message);
    }
    res.status(err.status).json(body);
    return;
  }

  // Unknown error: log everything, send nothing sensitive.
  logger.error(
    {
      requestId,
      method: req.method,
      path: req.path,
      err:
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : String(err),
    },
    "Unhandled error",
  );

  const body: ApiErrorResponse = {
    error: {
      code: "INTERNAL",
      message: "Something went wrong.",
      ...(requestId !== undefined ? { requestId } : {}),
    },
  };
  res.status(500).json(body);
};

/**
 * Catch-all 404 handler. Register after all routes, before errorHandler.
 */
export const notFoundHandler: RequestHandler = (req, res) => {
  const requestId = getRequestId(req);
  const body: ApiErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: `No route matches ${req.method} ${req.path}`,
      ...(requestId !== undefined ? { requestId } : {}),
    },
  };
  res.status(404).json(body);
};
