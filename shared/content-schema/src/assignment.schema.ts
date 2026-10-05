import { z } from "zod";

import { itemCodeSchema } from "./code.schema.js";

export const assignmentRequirementSchema = z.object({
  id: z.string().min(1).max(20),
  text: z.string().min(1).max(500),
  check: z.unknown(),
});

export const assignmentSchema = z.object({
  code: itemCodeSchema,
  title: z.string().min(1).max(160),
  type: z.literal("assignment"),
  template: z.enum(["vanilla", "react"]),
  libraries: z.array(z.enum(["tailwind", "bootstrap"])).max(4),
  estMinutes: z.number().int().min(1).max(600).optional(),
  starterFiles: z.array(z.string()).min(1),
  requirements: z.array(assignmentRequirementSchema).min(1),
});

export type Assignment = z.infer<typeof assignmentSchema>;
