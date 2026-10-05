/**
 * Progress, XP, streaks, and practice rating types.
 */

/** One XP-earning action a learner completed. */
export const ACTIVITY_EVENT_TYPES = [
  "theory_done",
  "review_done",
  "quiz_passed",
  "exercise_passed",
  "workshop_step_passed",
  "workshop_done",
  "assignment_done",
  "problem_solved",
] as const;
export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export interface UserStats {
  userId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  /** ISO date (YYYY-MM-DD) of the user's last active day, in their timezone. */
  lastActiveDate: string | null;
  solvedCount: number;
  /** Null until at least 5 problems solved. */
  practiceRating: number | null;
  updatedAt: string;
}
