import { z } from "zod";

import { itemCodeSchema, moduleCodeSchema } from "./code.schema.js";

export const moduleSchema = z.object({
  code: moduleCodeSchema,
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  itemOrder: z.array(itemCodeSchema).min(1),
  status: z.enum(["draft", "published", "deprecated"]),
});

export type Module = z.infer<typeof moduleSchema>;
