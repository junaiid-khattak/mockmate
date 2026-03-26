import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/posthog/api-error";

const INTERVIEW_COLUMNS = `
  id,
  user_id,
  resume_file_id,
  mode,
  status,
  started_at,
  ended_at,
  duration_seconds,
  overall_score,
  summary,
  question_understanding_score,
  answer_correctness_score,
  reasoning_quality_score,
  followup_depth_score,
  communication_clarity_score,
  behavioral_story_quality_score,
  role_alignment_coverage_score,
  confidence_calibration_score,
  time_management_score,
  recovery_ability_score,
  performance_overall_score,
  performance_feedback,
  performance_strengths,
  performance_growth_areas,
  performance_next_steps,
  performance_status,
  performance_version,
  performance_error,
  performance_updated_at,
  created_at
`;

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/interviews/[id]" });
  }

  const interviewId = context.params.id;
  if (!interviewId) {
    return apiError({ error: "Missing interview id.", status: 400, route: "/api/interviews/[id]" });
  }

  const { data: interview, error } = await supabase
    .from("interview_sessions")
    .select(INTERVIEW_COLUMNS)
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return apiError({ error: "Unable to load interview session.", status: 500, route: "/api/interviews/[id]", userId: user.id, cause: error });
  }

  if (!interview) {
    return apiError({ error: "Not found.", status: 404, route: "/api/interviews/[id]", userId: user.id });
  }

  const response = NextResponse.json({ ok: true, interview });
  applyCookies(response);
  return response;
}
