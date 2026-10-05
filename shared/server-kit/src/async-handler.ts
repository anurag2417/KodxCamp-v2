import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express handler so rejected promises reach the error
 * middleware. Express 4 does not do this automatically — an async handler
 * that throws leaves the request hanging.
 *
 * Usage:
 *   router.post("/foo", asyncHandler(async (req, res) => {
 *     const data = await doThing();
 *     res.json({ data });
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
