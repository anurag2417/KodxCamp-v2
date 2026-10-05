import { z } from "zod";

import { itemCodeSchema, workshopStepCodeSchema } from "./code.schema.js";

export const workshopStepSchema = z.object({
  code: workshopStepCodeSchema,
  title: z.string().min(1).max(160),
  /** Relative path to the .mdx file containing the step's instructions. */
  instruction: z.string().min(1).max(300),
  /** Checks validated against the learner's current files. */
  checks: z.array(z.unknown()).min(1),
});

export const workshopSchema = z.object({
  code: itemCodeSchema,
  title: z.string().min(1).max(160),
  type: z.literal("workshop"),
  template: z.enum(["vanilla", "react"]),
  libraries: z.array(z.enum(["tailwind", "bootstrap"])).max(4),
  files: z.record(z.string(), z.string().max(100_000)),
  steps: z.array(workshopStepSchema).min(1),
});

export type Workshop = z.infer<typeof workshopSchema>;
