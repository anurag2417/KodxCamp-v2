/**
 * Application-level error. Every error the server intentionally raises is an
 * AppError. Unexpected errors (programming bugs, DB failures) are not — they
 * bubble up as generic Error and the error handler treats them as 500s.
 */

export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNPROCESSABLE"
  | "INTERNAL";

export interface AppErrorOptions {
  /** HTTP status code. */
  status: number;
  /** Short machine-readable code, e.g. "UNAUTHORIZED". */
  code: AppErrorCode;
  /** Human-readable message shown to the client. */
  message: string;
  /** Optional structured details, e.g. field-level validation errors. */
  details?: Record<string, unknown>;
  /** Optional inner error, kept for logging only — never sent to clients. */
  cause?: unknown;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: AppErrorCode;
  public readonly details: Record<string, unknown> | undefined;
  public override readonly cause: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.cause = options.cause;
  }

  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(
      details !== undefined
        ? { status: 400, code: "BAD_REQUEST", message, details }
        : { status: 400, code: "BAD_REQUEST", message },
    );
  }

  static unauthorized(message = "Authentication required."): AppError {
    return new AppError({ status: 401, code: "UNAUTHORIZED", message });
  }

  static forbidden(message = "You do not have permission to do this."): AppError {
    return new AppError({ status: 403, code: "FORBIDDEN", message });
  }

  static notFound(message = "Not found."): AppError {
    return new AppError({ status: 404, code: "NOT_FOUND", message });
  }

  static conflict(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(
      details !== undefined
        ? { status: 409, code: "CONFLICT", message, details }
        : { status: 409, code: "CONFLICT", message },
    );
  }

  static rateLimited(message = "Too many requests. Try again in a moment."): AppError {
    return new AppError({ status: 429, code: "RATE_LIMITED", message });
  }

  static unprocessable(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(
      details !== undefined
        ? { status: 422, code: "UNPROCESSABLE", message, details }
        : { status: 422, code: "UNPROCESSABLE", message },
    );
  }

  static internal(message = "Something went wrong.", cause?: unknown): AppError {
    return cause !== undefined
      ? new AppError({ status: 500, code: "INTERNAL", message, cause })
      : new AppError({ status: 500, code: "INTERNAL", message });
  }
}

/** Type guard for AppError, works across module boundaries. */
export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    (value as { name: unknown }).name === "AppError" &&
    "status" in value &&
    "code" in value
  );
}
