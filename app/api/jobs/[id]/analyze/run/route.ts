import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/posthog/api-error";


const MIN_CONTENT_LENGTH = 50;

// ---------------------------------------------------------------------------
// POST /api/jobs/:id/analyze/run  –  Trigger a new analysis run
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/jobs/[id]/analyze/run" });
  }

  const jobId = context.params.id;
  if (!jobId) {
    return apiError({ error: "Missing job id.", status: 400, route: "/api/jobs/[id]/analyze/run" });
  }

  // Parse optional body
  const body = await request.json().catch(() => ({}));
  const force = body?.force === true;

  // Fetch the job (owner check via user_id filter)
  const { data: job, error: fetchErr } = await supabase
    .from("jobs")
    .select(
      "id, content, resume_id, fit_score_status, questions_status",
    )
    .eq("id", jobId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (fetchErr) {
    return apiError({ error: "Unable to load job.", status: 500, route: "/api/jobs/[id]/analyze/run", userId: data.user.id, cause: fetchErr });
  }
  if (!job) {
    return apiError({ error: "Not found.", status: 404, route: "/api/jobs/[id]/analyze/run", userId: data.user.id });
  }

  // Validate prerequisites
  if (!job.resume_id) {
    return apiError({ error: "A resume must be attached before running analysis.", status: 400, route: "/api/jobs/[id]/analyze/run", userId: data.user.id });
  }
  if (!job.content || job.content.trim().length < MIN_CONTENT_LENGTH) {
    return apiError({ error: `Job description content must be at least ${MIN_CONTENT_LENGTH} characters.`, status: 400, route: "/api/jobs/[id]/analyze/run", userId: data.user.id });
  }

  // If already pending and not forced, return early
  if (
    !force &&
    job.fit_score_status === "pending" &&
    job.questions_status === "pending"
  ) {
    return NextResponse.json({ ok: true, already_running: true });
  }

  // Generate new run id
  const analysisRunId = randomUUID();

  // Reset all analysis outputs and mark pending
  const { error: updateErr } = await supabase
    .from("jobs")
    .update({
      analysis_run_id: analysisRunId,
      analysis_requested_at: new Date().toISOString(),
      // Fit reset
      fit_score_status: "pending",
      fit_score: null,
      fit_score_error: null,
      fit_score_version: null,
      fit_strong_alignment: null,
      fit_weak_spots: null,
      fit_areas_to_probe: null,
      // Questions reset
      questions_status: "pending",
      questions: null,
      questions_error: null,
      questions_version: null,
    })
    .eq("id", jobId)
    .eq("user_id", data.user.id);

  if (updateErr) {
    return apiError({ error: "Unable to start analysis.", status: 500, route: "/api/jobs/[id]/analyze/run", userId: data.user.id, cause: updateErr });
  }

  // Enqueue SQS message
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    // Queue not configured — analysis row is marked pending but won't be
    // picked up until infra is deployed. Return success so the UI shows
    // pending state.
    const response = NextResponse.json({ ok: true, analysis_run_id: analysisRunId });
    applyCookies(response);
    return response;
  }

  try {
    const regionMatch = queueUrl.match(/sqs\.([^.]+)\.amazonaws\.com/);
    const region = regionMatch?.[1] ?? process.env.AWS_REGION ?? "us-east-1";
    const sqs = new SQSClient({ region });
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({
          job_id: jobId,
          analysis_run_id: analysisRunId,
          task_type: "BOTH",
          request_id: randomUUID(),
          force,
        }),
      }),
    );
  } catch {
    // SQS send failed — row is already marked pending. The DLQ / retry
    // mechanisms or a manual re-trigger can recover.
    return apiError({ error: "Analysis queued locally but SQS send failed.", status: 502, route: "/api/jobs/[id]/analyze/run", userId: data.user.id });
  }

  const response = NextResponse.json({ ok: true, analysis_run_id: analysisRunId });
  applyCookies(response);
  return response;
}
