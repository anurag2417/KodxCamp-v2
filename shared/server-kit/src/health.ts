import type { RequestHandler, Router } from "express";
import { Router as createRouter } from "express";

/**
 * Builds the health router:
 *   GET /health       — liveness. MUST NOT touch external services.
 *   GET /health/db    — readiness. Pings the DB. Not called by the uptime
 *                       monitor (that would keep Neon awake unnecessarily).
 *
 * The liveness check must always be fast and dependency-free — a free
 * uptime monitor pings it every 10 minutes to keep Render's free tier warm.
 */
export interface HealthOptions {
  /** A function that pings the DB. Should reject on failure. */
  dbCheck?: () => Promise<void>;
  /** Optional service name shown in the response. */
  serviceName?: string;
}

export function createHealthRouter(options: HealthOptions = {}): Router {
  const router = createRouter();
  const serviceName = options.serviceName ?? "kodxcamp";

  const liveness: RequestHandler = (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: serviceName,
      time: new Date().toISOString(),
    });
  };

  router.get("/health", liveness);
  // Render's health check sometimes hits /healthz. Alias it.
  router.get("/healthz", liveness);

  const dbCheck = options.dbCheck;
  if (dbCheck) {
    router.get("/health/db", async (_req, res) => {
      const started = Date.now();
      try {
        await dbCheck();
        res.status(200).json({
          status: "ok",
          service: serviceName,
          db: "reachable",
          latencyMs: Date.now() - started,
        });
      } catch (err) {
        res.status(503).json({
          status: "error",
          service: serviceName,
          db: "unreachable",
          latencyMs: Date.now() - started,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });
  }

  return router;
}
