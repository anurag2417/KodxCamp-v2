import { z } from "zod";

import { emailSchema, nameSchema, passwordSchema, timezoneSchema } from "./common.js";

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  timezone: timezoneSchema.optional(),
});

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const emailPreferencesSchema = z.object({
  weeklyDigestEnabled: z.boolean(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(128),
  confirmation: z.literal("DELETE"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EmailPreferencesInput = z.infer<typeof emailPreferencesSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
