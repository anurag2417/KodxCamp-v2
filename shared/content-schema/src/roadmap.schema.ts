import { z } from "zod";

import {
  courseCodeSchema,
  roadmapCodeSchema,
  problemCodeSchema,
} from "./code.schema.js";

export const roadmapItemSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("course"), code: courseCodeSchema }),
  z.object({ type: z.literal("practice-set"), code: z.string().min(1).max(64) }),
  z.object({ type: z.literal("problem"), code: problemCodeSchema }),
]);

export const roadmapLevelSchema = z.object({
  title: z.string().min(1).max(80),
  items: z.array(roadmapItemSchema).min(1),
});

export const roadmapSchema = z.object({
  code: roadmapCodeSchema,
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  levels: z.array(roadmapLevelSchema).min(1),
  status: z.enum(["draft", "published", "deprecated"]),
});

export type Roadmap = z.infer<typeof roadmapSchema>;
