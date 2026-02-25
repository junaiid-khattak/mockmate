import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

// Dashboard-specific job type with aggregated interview stats
export interface DashboardJob {
  id: string;
  title: string | null;
  company: string | null;
  source_url: string | null;
  resume_id: string | null;
  fit_score: number | null;
  fit_score_status: "pending" | "ready" | "failed" | null;
  questions_status: "pending" | "ready" | "failed" | null;
  created_at: string;
  updated_at: string;
  // Aggregated interview stats
  interview_count: number;
  best_score: number | null; // 0-100 scale (database scale)
  first_score: number | null; // 0-100 scale
  latest_score: number | null; // 0-100 scale
  improvement: number | null; // Difference between best and first
  last_interview_at: string | null;
  questions_count: number; // Number of questions ready for interview
}

/**
 * Fetch jobs with aggregated interview statistics for the dashboard
 * This is a client-side function - use with useEffect in the jobs page
 */
export async function getJobsWithInterviewStats(): Promise<{
  jobs: DashboardJob[];
  error: Error | null;
}> {
  const supabase = createBrowserSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { jobs: [], error: new Error("Unauthorized") };
  }

  // Fetch jobs
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(
      "id, title, company, source_url, resume_id, fit_score, fit_score_status, questions_status, questions, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (jobsError) {
    return { jobs: [], error: new Error(jobsError.message) };
  }

  if (!jobs || jobs.length === 0) {
    return { jobs: [], error: null };
  }

  // Fetch all interviews for these jobs
  const jobIds = jobs.map((j) => j.id);
  const { data: interviews, error: interviewsError } = await supabase
    .from("interview_sessions")
    .select(
      "id, job_id, performance_overall_score, attempt_number, created_at"
    )
    .in("job_id", jobIds)
    .eq("user_id", user.id);

  if (interviewsError) {
    return { jobs: [], error: new Error(interviewsError.message) };
  }

  // Group interviews by job_id
  const interviewsByJob = new Map<string, typeof interviews>();
  (interviews ?? []).forEach((interview) => {
    if (!interview.job_id) return;
    const existing = interviewsByJob.get(interview.job_id) ?? [];
    existing.push(interview);
    interviewsByJob.set(interview.job_id, existing);
  });

  // Enrich jobs with interview stats
  const enrichedJobs: DashboardJob[] = jobs.map((job) => {
    const jobInterviews = interviewsByJob.get(job.id) ?? [];

    // Sort chronologically (oldest first) to get the first attempt
    const chronological = [...jobInterviews].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    // Sort reverse-chronologically to get the latest
    const reverseChronological = [...jobInterviews].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Collect all non-null scores
    const allScores = jobInterviews
      .map((i) => i.performance_overall_score)
      .filter((s): s is number => s != null);

    // First chronological score (may be null if no score yet)
    const firstScore = chronological.map((i) => i.performance_overall_score).find((s): s is number => s != null) ?? null;
    const bestScore = allScores.length > 0 ? Math.max(...allScores) : null;

    // Count questions (parse JSONB array)
    let questionsCount = 10; // Default
    if (job.questions && Array.isArray(job.questions)) {
      questionsCount = (job.questions as unknown[]).length;
    }

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      source_url: job.source_url,
      resume_id: job.resume_id,
      fit_score: job.fit_score,
      fit_score_status: job.fit_score_status,
      questions_status: job.questions_status,
      created_at: job.created_at,
      updated_at: job.updated_at,
      interview_count: jobInterviews.length,
      best_score: bestScore,
      first_score: firstScore,
      latest_score: reverseChronological[0]?.performance_overall_score ?? null,
      improvement:
        firstScore != null && bestScore != null && allScores.length >= 2
          ? bestScore - firstScore
          : null,
      last_interview_at: reverseChronological[0]?.created_at ?? null,
      questions_count: questionsCount,
    };
  });

  return { jobs: enrichedJobs, error: null };
}

/**
 * Compute aggregate statistics across all jobs for the dashboard stats row
 */
export function computeDashboardStats(jobs: DashboardJob[]) {
  const totalJobs = jobs.length;
  const totalInterviews = jobs.reduce((sum, j) => sum + j.interview_count, 0);
  const uniqueCompanies = new Set(
    jobs.map((j) => j.company).filter((c): c is string => c != null)
  ).size;
  const jobsWithInterviews = jobs.filter((j) => j.interview_count > 0).length;
  const jobsWithoutInterviews = totalJobs - jobsWithInterviews;

  const allBestScores = jobs
    .map((j) => j.best_score)
    .filter((s): s is number => s != null);
  const overallBestScore =
    allBestScores.length > 0 ? Math.max(...allBestScores) : null;
  const bestScoreJobTitle = overallBestScore
    ? jobs.find((j) => j.best_score === overallBestScore)?.title ?? null
    : null;

  return {
    totalJobs,
    totalInterviews,
    uniqueCompanies,
    jobsWithInterviews,
    jobsWithoutInterviews,
    overallBestScore, // 0-100 scale
    bestScoreJobTitle,
  };
}

/**
 * Sort jobs to prioritize unpracticed jobs first, then by most recent activity
 */
export function sortJobsForDashboard(jobs: DashboardJob[]): DashboardJob[] {
  return [...jobs].sort((a, b) => {
    // Unpracticed jobs first
    if (a.interview_count === 0 && b.interview_count > 0) return -1;
    if (a.interview_count > 0 && b.interview_count === 0) return 1;

    // Then by most recently active
    const aTime = a.last_interview_at
      ? new Date(a.last_interview_at).getTime()
      : new Date(a.created_at).getTime();
    const bTime = b.last_interview_at
      ? new Date(b.last_interview_at).getTime()
      : new Date(b.created_at).getTime();
    return bTime - aTime;
  });
}
