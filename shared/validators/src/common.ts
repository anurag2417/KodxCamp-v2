import { z } from "zod";

/** Lowercase email, max 254 chars (RFC 5321). */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

/** Password rules: min 8, max 128, requires a letter and a digit. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a digit");

/** Human name: 1–80 chars, trimmed. */
export const nameSchema = z.string().trim().min(1).max(80);

/** IANA timezone string. Loose validation (checked further at runtime). */
export const timezoneSchema = z.string().min(1).max(64);

/** UUID v4 in canonical form. */
export const uuidSchema = z.string().uuid();

/** Content code pattern, e.g. "PY-C0012" or "PY-W0003.S05". */
export const contentCodeSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Z][A-Z0-9-]*(\.[A-Z]\d+)?$/, "Invalid content code");
