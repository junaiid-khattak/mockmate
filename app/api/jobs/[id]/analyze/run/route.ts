import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

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
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const jobId = context.params.id;
  if (!jobId) {
    return NextResponse.json(
      { ok: false, error: "Missing job id." },
      { status: 400 },
    );
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
    return NextResponse.json(
      { ok: false, error: "Unable to load job." },
      { status: 500 },
    );
  }
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "Not found." },
      { status: 404 },
    );
  }

  // Validate prerequisites
  if (!job.resume_id) {
    return NextResponse.json(
      { ok: false, error: "A resume must be attached before running analysis." },
      { status: 400 },
    );
  }
  if (!job.content || job.content.trim().length < MIN_CONTENT_LENGTH) {
    return NextResponse.json(
      {
        ok: false,
        error: `Job description content must be at least ${MIN_CONTENT_LENGTH} characters.`,
      },
      { status: 400 },
    );
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
    return NextResponse.json(
      { ok: false, error: "Unable to start analysis." },
      { status: 500 },
    );
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
    const sqs = new SQSClient({});
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
    const response = NextResponse.json(
      { ok: false, error: "Analysis queued locally but SQS send failed." },
      { status: 502 },
    );
    applyCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true, analysis_run_id: analysisRunId });
  applyCookies(response);
  return response;
}
