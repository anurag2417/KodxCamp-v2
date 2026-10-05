import { z } from "zod";

import { landingCodeSchema } from "./code.schema.js";

export const landingSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    headline: z.string().min(1).max(200),
    sub: z.string().min(1).max(400),
    cta: z.string().min(1).max(60),
  }),
  z.object({ type: z.literal("outcomes"), items: z.array(z.string()).min(1).max(12) }),
  z.object({ type: z.literal("syllabus"), auto: z.literal(true) }),
  z.object({ type: z.literal("stats"), items: z.array(z.string()).min(1).max(8) }),
  z.object({
    type: z.literal("instructor"),
    name: z.string().min(1).max(120),
    bio: z.string().min(1).max(2000),
  }),
  z.object({
    type: z.literal("faq"),
    items: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(1).max(30),
  }),
  z.object({ type: z.literal("couponBox") }),
  z.object({ type: z.literal("waitlist") }),
  z.object({ type: z.literal("cta") }),
]);

export const landingSchema = z.object({
  code: landingCodeSchema,
  target: z.object({
    type: z.enum(["course", "roadmap", "cohort", "project"]),
    code: z.string().min(1).max(64),
  }),
  seo: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(300),
    ogImage: z.string().min(1).max(300).optional(),
  }),
  sections: z.array(landingSectionSchema).min(1),
});

export type Landing = z.infer<typeof landingSchema>;
