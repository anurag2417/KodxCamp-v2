/**
 * Shape of every HTTP API response in KodxCamp.
 *
 * Success responses are either the resource directly or a wrapped payload.
 * Error responses always use ApiErrorResponse.
 */

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    /** Optional extra context, e.g. field-level validation errors. */
    details?: Record<string, unknown>;
    /** Reference ID for tracing in logs and support tickets. */
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T> {
  data: T;
}

/** Pagination metadata for list endpoints. */
export interface PageInfo {
  /** Opaque cursor to pass as ?cursor= for the next page. */
  nextCursor: string | null;
  /** True if there are more items after this page. */
  hasMore: boolean;
}

export interface Paginated<T> {
  items: T[];
  pageInfo: PageInfo;
}
