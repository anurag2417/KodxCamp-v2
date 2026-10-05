import { z } from "zod";

import { courseCodeSchema, moduleCodeSchema } from "./code.schema.js";

export const courseLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const courseStatusSchema = z.enum(["draft", "published", "deprecated"]);

export const courseSchema = z.object({
  code: courseCodeSchema,
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  level: courseLevelSchema,
  category: z.string().min(1).max(40),
  tags: z.array(z.string().min(1).max(30)).max(20),
  language: z.string().min(1).max(20),
  featured: z.boolean(),
  estimatedHours: z.number().int().min(1).max(500).nullable(),
  moduleOrder: z.array(moduleCodeSchema).min(1),
  status: courseStatusSchema,
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type Course = z.infer<typeof courseSchema>;
