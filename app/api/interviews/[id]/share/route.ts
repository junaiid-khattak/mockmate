import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/posthog/api-error";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/interviews/[id]/share" });
  }

  const interviewId = context.params.id;

  // Fetch current share state (must own the interview)
  const { data: interview, error: fetchErr } = await supabase
    .from("interview_sessions")
    .select("id, is_shared, share_token")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr) {
    return apiError({ error: "Database error", status: 500, route: "/api/interviews/[id]/share", userId: user.id, cause: fetchErr });
  }
  if (!interview) {
    return apiError({ error: "Not found", status: 404, route: "/api/interviews/[id]/share", userId: user.id });
  }

  const newIsShared = !interview.is_shared;
  // Generate a token once; keep it forever so the link stays stable if re-enabled
  const token = interview.share_token ?? crypto.randomUUID();

  const { error: updateErr } = await supabase
    .from("interview_sessions")
    .update({ is_shared: newIsShared, share_token: token })
    .eq("id", interviewId)
    .eq("user_id", user.id);

  if (updateErr) {
    return apiError({ error: "Failed to update sharing", status: 500, route: "/api/interviews/[id]/share", userId: user.id, cause: updateErr });
  }

  const response = NextResponse.json({
    ok: true,
    is_shared: newIsShared,
    share_token: token,
  });
  applyCookies(response);
  return response;
}
