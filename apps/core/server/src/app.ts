import express from "express";

import {
  createHealthRouter,
  createSecurityMiddleware,
  errorHandler,
  getRequestId,
  logger,
  notFoundHandler,
  requestId,
} from "@kodxcamp/server-kit";

import { pingDb } from "./db/client.js";

/**
 * Assembles the Express application. No business logic — only middleware,
 * routers, and error handlers. The `index.ts` file is responsible for
 * starting the listener.
 */
export function createApp(): express.Express {
  const app = express();

  // Trust Render's proxy so req.ip and rate limiting see real client IPs.
  // The hop count is safe because Render's edge is a single trusted proxy.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // ---- Middleware (order matters) ----
  app.use(requestId);
  app.use(createSecurityMiddleware());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // ---- Logging ----
  // Minimal request logger. Rich logging comes in Phase 1a if needed.
  app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      logger.info(
        {
          requestId: getRequestId(req),
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - started,
        },
        "request",
      );
    });
    next();
  });

  // ---- Routes ----
  app.use(
    createHealthRouter({
      serviceName: "core-server",
      dbCheck: pingDb,
    }),
  );

  // ---- 404 and error handling (must be last) ----
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
