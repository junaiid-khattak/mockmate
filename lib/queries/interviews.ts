import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

// Interview session type matching the database schema
export type InterviewSession = {
  id: string;
  user_id: string;
  job_id: string | null;
  resume_file_id: string | null;
  attempt_number: number;
  mode: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  overall_score: number | null;
  summary: string | null;
  // Performance metrics (0-100)
  question_understanding_score: number | null;
  answer_correctness_score: number | null;
  reasoning_quality_score: number | null;
  followup_depth_score: number | null;
  communication_clarity_score: number | null;
  behavioral_story_quality_score: number | null;
  role_alignment_coverage_score: number | null;
  confidence_calibration_score: number | null;
  time_management_score: number | null;
  recovery_ability_score: number | null;
  performance_overall_score: number | null;
  performance_feedback: unknown | null;
  performance_strengths: string[] | null;
  performance_growth_areas: string[] | null;
  performance_next_steps: string[] | null;
  performance_status: "pending" | "ready" | "failed" | null;
  performance_version: string | null;
  performance_error: string | null;
  performance_updated_at: string | null;
  // New multi-attempt fields
  transcript: unknown[] | null;
  recommendations: unknown[] | null;
  // Sharing
  is_shared: boolean;
  share_token: string | null;
  created_at: string;
};

const INTERVIEW_COLUMNS = `
  id,
  user_id,
  job_id,
  resume_file_id,
  attempt_number,
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
  transcript,
  recommendations,
  is_shared,
  share_token,
  created_at
`.trim();

/**
 * Fetch all interviews for a specific job by the current user
 * Ordered by attempt_number descending (newest first)
 */
export async function getInterviewsForJob(
  request: NextRequest,
  jobId: string,
): Promise<{ interviews: InterviewSession[]; error: Error | null }> {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { interviews: [], error: new Error("Unauthorized") };
  }

  const { data, error } = await supabase
    .from("interview_sessions")
    .select(INTERVIEW_COLUMNS)
    .eq("job_id", jobId)
    .eq("user_id", user.id)
    .order("attempt_number", { ascending: false });

  if (error) {
    return { interviews: [], error: new Error(error.message) };
  }

  return { interviews: (data as unknown as InterviewSession[]) ?? [], error: null };
}

/**
 * Get the latest interview for a job
 * Returns the interview with the highest attempt_number
 */
export async function getLatestInterviewForJob(
  request: NextRequest,
  jobId: string,
): Promise<{ interview: InterviewSession | null; error: Error | null }> {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { interview: null, error: new Error("Unauthorized") };
  }

  const { data, error } = await supabase
    .from("interview_sessions")
    .select(INTERVIEW_COLUMNS)
    .eq("job_id", jobId)
    .eq("user_id", user.id)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { interview: null, error: new Error(error.message) };
  }

  return { interview: data as InterviewSession | null, error: null };
}

/**
 * Get the next attempt number for a job
 * Used when creating a new interview session
 */
export async function getNextAttemptNumber(
  request: NextRequest,
  jobId: string,
): Promise<{ attemptNumber: number; error: Error | null }> {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { attemptNumber: 1, error: new Error("Unauthorized") };
  }

  const { data, error } = await supabase
    .from("interview_sessions")
    .select("attempt_number")
    .eq("job_id", jobId)
    .eq("user_id", user.id)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return { attemptNumber: 1, error: new Error(error.message) };
  }

  const nextAttempt = data ? (data.attempt_number as number) + 1 : 1;
  return { attemptNumber: nextAttempt, error: null };
}

/**
 * Get a specific interview by ID
 * Validates that it belongs to the current user
 */
export async function getInterviewById(
  request: NextRequest,
  interviewId: string,
): Promise<{ interview: InterviewSession | null; error: Error | null }> {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { interview: null, error: new Error("Unauthorized") };
  }

  const { data, error } = await supabase
    .from("interview_sessions")
    .select(INTERVIEW_COLUMNS)
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { interview: null, error: new Error(error.message) };
  }

  return { interview: data as InterviewSession | null, error: null };
}
