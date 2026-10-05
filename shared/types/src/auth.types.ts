/**
 * Auth-related types shared between the auth server and its clients.
 */

export const USER_ROLES = ["student", "instructor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "pending_terms", "disabled"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const OAUTH_PROVIDERS = ["google", "github"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const CONSENT_DOC_TYPES = ["terms", "privacy"] as const;
export type ConsentDocType = (typeof CONSENT_DOC_TYPES)[number];

/** The authenticated user, as returned by /me endpoints. */
export interface SessionUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  timezone: string;
  createdAt: string;
}
