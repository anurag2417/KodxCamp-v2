import { z } from "zod";

import { itemCodeSchema } from "./code.schema.js";

export const itemTypeSchema = z.enum([
  "theory",
  "coding",
  "quiz",
  "review",
  "workshop",
  "assignment",
]);

/** Common metadata on every item header. */
export const itemMetaSchema = z.object({
  code: itemCodeSchema,
  title: z.string().min(1).max(160),
  type: itemTypeSchema,
  estMinutes: z.number().int().min(1).max(600).optional(),
  status: z.enum(["draft", "published", "deprecated"]),
});

export type ItemMeta = z.infer<typeof itemMetaSchema>;
