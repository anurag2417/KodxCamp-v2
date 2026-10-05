import helmet from "helmet";

/**
 * Helmet with sane defaults for a JSON API.
 *
 * - contentSecurityPolicy: disabled (no HTML served from these services)
 * - crossOriginResourcePolicy: "cross-origin" (SPAs on other domains call us)
 * - referrerPolicy: "no-referrer"
 * - hsts: enabled in production only (needs HTTPS)
 */
export function createSecurityMiddleware() {
  const isProduction = process.env["NODE_ENV"] === "production";
  return helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
    hsts: isProduction ? { maxAge: 15552000, includeSubDomains: true } : false,
  });
}
