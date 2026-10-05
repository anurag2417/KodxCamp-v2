/**
 * Access control types — coupons, grants, and what they unlock.
 */

export const SCOPE_TYPES = ["course", "roadmap", "cohort", "all"] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export const GRANT_SOURCES = ["coupon", "purchase", "admin"] as const;
export type GrantSource = (typeof GRANT_SOURCES)[number];

export interface Grant {
  id: string;
  userId: string;
  scopeType: ScopeType;
  /** Content code for course/roadmap/cohort; null when scopeType is "all". */
  scopeCode: string | null;
  source: GrantSource;
  sourceRef: string | null;
  grantedAt: string;
  /** Null means lifetime access. */
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  scopeType: ScopeType;
  scopeCode: string | null;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  grantDurationDays: number | null;
  campaign: string | null;
  active: boolean;
  createdAt: string;
}
