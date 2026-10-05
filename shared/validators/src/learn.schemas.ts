import { z } from "zod";

import { contentCodeSchema } from "./common.js";

export const itemProgressSchema = z.object({
  itemCode: contentCodeSchema,
  status: z.enum(["in_progress", "completed"]),
});

export const exerciseSubmitSchema = z.object({
  itemCode: contentCodeSchema,
  language: z.enum(["python", "javascript", "typescript"]),
  code: z.string().max(100_000),
});

export const quizSubmitSchema = z.object({
  itemCode: contentCodeSchema,
  answers: z.record(z.string(), z.number().int().min(0)),
});

export const workshopStateSchema = z.object({
  workshopCode: contentCodeSchema,
  files: z.record(z.string(), z.string().max(100_000)),
  currentStep: z.number().int().min(1),
  completedSteps: z.array(z.number().int().min(1)),
});

export const lessonFeedbackSchema = z.object({
  itemCode: contentCodeSchema,
  vote: z.union([z.literal(-1), z.literal(1)]),
  comment: z.string().trim().max(2000).nullable(),
});

export type ItemProgressInput = z.infer<typeof itemProgressSchema>;
export type ExerciseSubmitInput = z.infer<typeof exerciseSubmitSchema>;
export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
export type WorkshopStateInput = z.infer<typeof workshopStateSchema>;
export type LessonFeedbackInput = z.infer<typeof lessonFeedbackSchema>;
