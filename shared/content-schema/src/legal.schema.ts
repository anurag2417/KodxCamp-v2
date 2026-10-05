import { z } from "zod";

/** Points to the current version of each legal document. */
export const legalSchema = z.object({
  terms: z.string().regex(/^v\d+$/),
  privacy: z.string().regex(/^v\d+$/),
});

export type Legal = z.infer<typeof legalSchema>;
