import { z } from "zod";

import { itemCodeSchema } from "./code.schema.js";

export const quizQuestionSchema = z.object({
  id: z.string().min(1).max(20),
  prompt: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(300)).min(2).max(8),
  answerIndex: z.number().int().min(0),
  explanation: z.string().min(1).max(800),
});

export const quizSchema = z.object({
  code: itemCodeSchema,
  title: z.string().min(1).max(160),
  type: z.literal("quiz"),
  passMark: z.number().int().min(0).max(100),
  questions: z.array(quizQuestionSchema).min(1),
});

export type Quiz = z.infer<typeof quizSchema>;
