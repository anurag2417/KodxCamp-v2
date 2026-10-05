/**
 * Content-related types. The database stores content codes (strings);
 * the content package owns the full structure of courses, modules, items.
 */

export const ITEM_TYPES = [
  "theory",
  "coding",
  "quiz",
  "review",
  "workshop",
  "assignment",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

/**
 * A permanent label for a piece of content. Examples:
 *   "CRS-PY"      — Course
 *   "PY-M003"     — Module
 *   "PY-C0012"    — Item
 *   "PY-W0003.S05"— Workshop step
 *   "PRB-00231"   — Problem
 *   "RDM-0001"    — Roadmap
 */
export type ContentCode = string;

/** A summary of a course as used in catalogs and dashboards. */
export interface CourseSummary {
  code: ContentCode;
  slug: string;
  title: string;
  summary: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  estimatedHours: number | null;
  featured: boolean;
}
