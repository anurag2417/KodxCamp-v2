import { logger } from "@kodxcamp/server-kit";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closePool, getPool } from "./db/client.js";

/**
 * Entrypoint. Starts the HTTP listener and wires graceful shutdown.
 */

function main(): void {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        env: env.NODE_ENV,
        port: env.PORT,
        db: getPool() !== null ? "configured" : "not-configured",
      },
      "core-server listening",
    );
  });

  // Graceful shutdown: stop accepting connections, close the DB pool,
  // exit cleanly. Render sends SIGTERM before killing the process.
  const shutdown = (signal: string): void => {
    logger.info({ signal }, "shutting down");
    server.close((err) => {
      if (err !== undefined) {
        logger.error({ err }, "error during server.close");
      }
      closePool()
        .catch((poolErr: unknown) => {
          logger.error({ poolErr }, "error closing DB pool");
        })
        .finally(() => {
          process.exit(err !== undefined ? 1 : 0);
        });
    });

    // Force-exit if graceful shutdown stalls.
    setTimeout(() => {
      logger.error({}, "shutdown timeout — forcing exit");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
