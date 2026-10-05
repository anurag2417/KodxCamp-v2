import { z } from "zod";

import { contentCodeSchema } from "./common.js";

export const problemSubmitSchema = z.object({
  problemCode: contentCodeSchema,
  language: z.enum(["python", "javascript", "typescript", "sql"]),
  code: z.string().max(100_000),
});

export const projectStateSchema = z.object({
  projectCode: contentCodeSchema,
  status: z.enum(["in_progress", "completed"]),
  files: z.record(z.string(), z.string().max(100_000)),
});

export type ProblemSubmitInput = z.infer<typeof problemSubmitSchema>;
export type ProjectStateInput = z.infer<typeof projectStateSchema>;
