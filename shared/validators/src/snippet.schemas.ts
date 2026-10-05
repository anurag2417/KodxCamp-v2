import { z } from "zod";

export const LANGUAGES = ["javascript", "typescript", "python", "ruby", "sql"] as const;

export const createSnippetSchema = z.object({
  language: z.enum(LANGUAGES),
  title: z.string().trim().max(120).nullable(),
  code: z.string().max(100_000),
  stdin: z.string().max(10_000).nullable(),
  visibility: z.enum(["private", "unlisted"]).default("unlisted"),
});

export const updateSnippetSchema = createSnippetSchema.partial();

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
