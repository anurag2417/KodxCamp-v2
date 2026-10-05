import { randomUUID } from "node:crypto";

import type { NextFunction, Request, RequestHandler, Response } from "express";

declare module "express" {
  interface Request {
    requestId?: string;
  }
}

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
  req.requestId = id;
  res.setHeader(HEADER, id);
  next();
};

export function getRequestId(req: Request): string | undefined {
  return req.requestId;
}
