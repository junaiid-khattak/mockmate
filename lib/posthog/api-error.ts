import { NextResponse } from "next/server";
import { getServerPostHog } from "./server";

type ApiErrorOptions = {
  /** The error message returned to the client */
  error: string;
  /** HTTP status code */
  status: number;
  /** Supabase user ID (if known) */
  userId?: string;
  /** The API route path, e.g. "/api/auth/signup" */
  route: string;
  /** Original error object (if available) */
  cause?: unknown;
  /** Additional properties to attach to the PostHog event */
  extra?: Record<string, unknown>;
};

/**
 * Returns a JSON error response AND captures the error to PostHog server-side.
 *
 * Usage:
 *   return apiError({ error: "Not found.", status: 404, route: "/api/jobs/[id]", userId: user?.id });
 */
export function apiError({ error, status, userId, route, cause, extra }: ApiErrorOptions) {
  try {
    const posthog = getServerPostHog();
    posthog.capture({
      distinctId: userId ?? "anonymous",
      event: "api_error",
      properties: {
        error_message: error,
        status_code: status,
        route,
        ...(cause instanceof Error && { error_stack: cause.stack }),
        ...extra,
      },
    });
  } catch {
    // PostHog capture should never block the API response
  }

  return NextResponse.json({ ok: false, error }, { status });
}
