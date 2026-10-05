/**
 * Minimal structured logger. Wraps console with a stable object-first API
 * so we can swap in pino later without touching call sites.
 *
 * Levels:
 *   debug — verbose, only when LOG_LEVEL=debug
 *   info  — normal operations
 *   warn  — recoverable issues (4xx, deprecations)
 *   error — unexpected (5xx, unhandled)
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLevel(): LogLevel {
  const raw = process.env["LOG_LEVEL"];
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return process.env["NODE_ENV"] === "production" ? "info" : "debug";
}

function enabled(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel()];
}

function emit(level: LogLevel, meta: unknown, msg: string): void {
  if (!enabled(level)) {
    return;
  }
  const line = {
    time: new Date().toISOString(),
    level,
    msg,
    ...(meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {}),
  };
  // Route to the appropriate console method for correct stderr/stdout split.
  if (level === "error") {
    console.error(JSON.stringify(line));
  } else if (level === "warn") {
    console.warn(JSON.stringify(line));
  } else {
    console.log(JSON.stringify(line));
  }
}

export const logger = {
  debug(meta: unknown, msg?: string): void {
    emit("debug", meta, msg ?? "");
  },
  info(meta: unknown, msg?: string): void {
    emit("info", meta, msg ?? "");
  },
  warn(meta: unknown, msg?: string): void {
    emit("warn", meta, msg ?? "");
  },
  error(meta: unknown, msg?: string): void {
    emit("error", meta, msg ?? "");
  },
};
