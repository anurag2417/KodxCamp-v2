import type { RequestHandler } from "express";
import type { z } from "zod";

import { AppError } from "./app-error.js";

type UnknownSchema = z.ZodType<unknown, z.ZodTypeDef, unknown>;

export interface ValidationTargets {
  body?: UnknownSchema;
  query?: UnknownSchema;
  params?: UnknownSchema;
}

/**
 * Runs the schema and forces the result into `unknown`, breaking the `any`
 * chain that Zod 3 leaks through `parse()`'s inferred return type.
 * The `as unknown as unknown` pattern is deliberate: the first cast erases
 * `any`, the second documents intent.
 */
function parseUnknown(schema: UnknownSchema, data: unknown): unknown {
  const raw: unknown = schema.parse(data);
  return raw;
}

export function validate(targets: ValidationTargets): RequestHandler {
  return (req, _res, next) => {
    try {
      if (targets.params !== undefined) {
        const parsed = parseUnknown(targets.params, req.params);
        // `parsed` is unknown; overwrite params with the validated object.
        Object.assign(req.params as Record<string, unknown>, parsed);
      }
      if (targets.query !== undefined) {
        const parsed = parseUnknown(targets.query, req.query);
        if (parsed !== null && typeof parsed === "object") {
          const target = req.query as Record<string, unknown>;
          for (const [k, v] of Object.entries(parsed)) {
            target[k] = v;
          }
        }
      }
      if (targets.body !== undefined) {
        const parsed = parseUnknown(targets.body, req.body);
        // Express body is `any`; we replace it with our validated unknown.
        // The cast is intentional and scoped to this single assignment.
        (req as { body: unknown }).body = parsed;
      }
      next();
    } catch (err) {
      if (isZodError(err)) {
        const details: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "_root";
          const bucket = details[key] ?? (details[key] = []);
          bucket.push(issue.message);
        }
        next(AppError.badRequest("Validation failed.", { fields: details }));
        return;
      }
      next(err);
    }
  };
}

interface ZodIssueLike {
  path: PropertyKey[];
  message: string;
}

function isZodError(value: unknown): value is { issues: ZodIssueLike[] } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("issues" in value)) {
    return false;
  }
  return Array.isArray((value as { issues: unknown }).issues);
}
