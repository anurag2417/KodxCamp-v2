import { z } from "zod";

import { projectCodeSchema } from "./code.schema.js";

export const projectSchema = z.object({
  code: projectCodeSchema,
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(500),
  template: z.enum(["vanilla", "react"]),
  libraries: z.array(z.enum(["tailwind", "bootstrap"])).max(4),
  estMinutes: z.number().int().min(1).max(2000),
  tags: z.array(z.string()).max(20),
  status: z.enum(["draft", "published", "deprecated"]),
});

export type Project = z.infer<typeof projectSchema>;
