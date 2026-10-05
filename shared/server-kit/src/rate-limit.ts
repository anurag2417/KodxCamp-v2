import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

/**
 * Creates a rate limiter middleware. Use one limiter per logical surface
 * (login, signup, coupon redeem, snippet save) so they don't share counters.
 */
export interface RateLimitOptions {
  /** Time window in milliseconds. */
  windowMs: number;
  /** Max requests per window per IP. */
  max: number;
  /** Message shown when limit is hit. */
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions): RateLimitRequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: options.message ?? "Too many requests. Try again in a moment.",
      },
    },
  });
}
