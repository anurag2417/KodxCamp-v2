import { z } from "zod";

/**
 * Content-code patterns. A code is a permanent label — never changed once
 * a piece of content ships. The build fails if a previously shipped code
 * disappears.
 *
 *   CRS-PY        — a course
 *   PY-M001       — a module inside course PY
 *   PY-C0012      — an item inside course PY (C = coding)
 *   PY-W0003.S05  — a workshop step
 *   PRB-00231     — a practice problem
 *   PRJ-0007      — a project
 *   RDM-0001      — a roadmap
 *   LND-0004      — a landing page
 *   COH-0001      — a cohort
 */
export const courseCodeSchema = z.string().regex(/^CRS-[A-Z]{2,8}$/);
export const moduleCodeSchema = z.string().regex(/^[A-Z]{2,8}-M\d{3}$/);
export const itemCodeSchema = z.string().regex(/^[A-Z]{2,8}-[TCQRWA]\d{4}$/);
export const workshopStepCodeSchema = z.string().regex(/^[A-Z]{2,8}-W\d{4}\.S\d{2}$/);
export const problemCodeSchema = z.string().regex(/^PRB-\d{5}$/);
export const projectCodeSchema = z.string().regex(/^PRJ-\d{4}$/);
export const roadmapCodeSchema = z.string().regex(/^RDM-\d{4}$/);
export const landingCodeSchema = z.string().regex(/^LND-\d{4}$/);
export const cohortCodeSchema = z.string().regex(/^COH-\d{4}$/);

/** Item-type letter → readable type name. */
export const ITEM_TYPE_BY_LETTER = {
  T: "theory",
  C: "coding",
  Q: "quiz",
  R: "review",
  W: "workshop",
  A: "assignment",
} as const;
