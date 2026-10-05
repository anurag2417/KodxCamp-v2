import { z } from "zod";

import { contentCodeSchema } from "./common.js";

export const SCOPE_TYPES = ["course", "roadmap", "cohort", "all"] as const;

export const redeemCouponSchema = z.object({
  code: z.string().trim().min(4).max(64),
});

export const createCouponSchema = z
  .object({
    scopeType: z.enum(SCOPE_TYPES),
    scopeCode: contentCodeSchema.nullable(),
    maxRedemptions: z.number().int().positive().nullable(),
    expiresAt: z.string().datetime().nullable(),
    grantDurationDays: z.number().int().positive().nullable(),
    campaign: z.string().trim().max(64).nullable(),
    note: z.string().trim().max(500).nullable(),
    count: z.number().int().min(1).max(1000).default(1),
  })
  .refine(
    (v) => (v.scopeType === "all" ? v.scopeCode === null : v.scopeCode !== null),
    { message: "scopeCode must be null only when scopeType is 'all'" },
  );

export type RedeemCouponInput = z.infer<typeof redeemCouponSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
