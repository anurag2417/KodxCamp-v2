import { randomUUID } from "node:crypto";

import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Stores request IDs in a WeakMap keyed by the Request object.
 *
 * Why a WeakMap instead of `declare module "express"` augmentation?
 * Module augmentation requires `express-serve-static-core` to be resolvable
 * from this workspace. pnpm's strict node_modules layout doesn't hoist that
 * transitive type package, so the augmentation silently fails to merge. A
 * WeakMap sidesteps the entire problem — no module augmentation, no type
 * gymnastics, works in every workspace that imports this module.
 *
 * WeakMap (not Map) so entries are garbage-collected when the request ends.
 */

const requestIds = new WeakMap<Request, string>();

const HEADER = "x-request-id";

/**
 * Assigns each request a unique ID. Clients may pass `X-Request-Id` to
 * correlate requests across services; we honor it if present, otherwise
 * generate a UUID v4.
 *
 * The ID is echoed back in the response header for easy debugging.
 */
export const requestId: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.header(HEADER);
  const id = incoming && incoming.length <= 128 ? incoming : randomUUID();
  requestIds.set(req, id);
  res.setHeader(HEADER, id);
  next();
};

/**
 * Returns the request ID associated with a request, or undefined if the
 * requestId middleware hasn't run for it.
 */
export function getRequestId(req: Request): string | undefined {
  return requestIds.get(req);
}
