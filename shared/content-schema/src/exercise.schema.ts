import { z } from "zod";

import { itemCodeSchema } from "./code.schema.js";

export const codingCaseSchema = z.object({
  in: z.string().min(1),
  out: z.string().min(1),
  hidden: z.boolean(),
});

export const exerciseSchema = z.object({
  code: itemCodeSchema,
  title: z.string().min(1).max(160),
  type: z.literal("coding"),
  language: z.enum(["python", "javascript", "typescript"]),
  timeLimitMs: z.number().int().min(100).max(30_000),
  hints: z.array(z.string().min(1).max(300)).max(20),
  cases: z.array(codingCaseSchema).min(1),
  /** Optional difficulty rating for practice-style items. */
  rating: z.number().int().min(500).max(3500).multipleOf(100).optional(),
  tags: z.array(z.string()).max(20).optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;
