import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/posthog/api-error";


const MIN_CONTENT_LENGTH = 50;

const JD_COLUMNS =
  "id, title, company, content, source_url, resume_id, interview_date, fit_score, fit_score_status, fit_score_version, fit_score_error, fit_score_updated_at, fit_strong_alignment, fit_weak_spots, fit_areas_to_probe, analysis_run_id, analysis_requested_at, questions, questions_status, questions_version, questions_error, questions_updated_at, created_at, updated_at";
const JD_LIST_COLUMNS =
  "id, title, company, source_url, resume_id, fit_score, fit_score_status, questions_status, created_at, updated_at";

// ---------------------------------------------------------------------------
// POST /api/jobs  –  Create a new job
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/jobs" });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError({ error: "Invalid payload.", status: 400, route: "/api/jobs", userId: data.user.id });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length < MIN_CONTENT_LENGTH) {
    return apiError({ error: `Content is required and must be at least ${MIN_CONTENT_LENGTH} characters.`, status: 400, route: "/api/jobs", userId: data.user.id });
  }

  const title = typeof body.title === "string" ? body.title.trim() || null : null;
  const company = typeof body.company === "string" ? body.company.trim() || null : null;
  const sourceUrl = typeof body.source_url === "string" ? body.source_url.trim() || null : null;
  const interviewDate = typeof body.interview_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.interview_date.trim())
    ? body.interview_date.trim()
    : null;

  // Validate optional resume_id
  let resumeId: string | null = null;
  let resumeAlreadyExtracted = false;
  if (body.resume_id != null) {
    if (typeof body.resume_id !== "string" || !body.resume_id.trim()) {
      return apiError({ error: "Invalid resume_id.", status: 400, route: "/api/jobs", userId: data.user.id });
    }
    resumeId = body.resume_id.trim();

    const { data: resume, error: resumeErr } = await supabase
      .from("resumes")
      .select("id, extracted_text_status")
      .eq("id", resumeId)
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (resumeErr) {
      return apiError({ error: "Unable to verify resume.", status: 500, route: "/api/jobs", userId: data.user.id, cause: resumeErr });
    }
    if (!resume) {
      return apiError({ error: "Resume not found.", status: 404, route: "/api/jobs", userId: data.user.id });
    }
    resumeAlreadyExtracted = resume.extracted_text_status === "successful";
  }

  const { data: jd, error } = await supabase
    .from("jobs")
    .insert({
      user_id: data.user.id,
      title,
      company,
      content,
      source_url: sourceUrl,
      resume_id: resumeId,
      interview_date: interviewDate,
      // If a resume is attached at creation, mark fit for scoring
      fit_score_status: resumeId ? "pending" : null,
    })
    .select(JD_COLUMNS)
    .single();

  if (error) {
    console.error("Supabase insert error:", JSON.stringify(error));
    return apiError({ error: "Unable to create job.", status: 500, route: "/api/jobs", userId: data.user.id, cause: error });
  }

  // Trigger job analysis via SQS. The wizard guarantees extraction is complete
  // before the user reaches this step, so resumeAlreadyExtracted is always true
  // in the normal flow. Guard is kept for safety (e.g. direct API calls).
  if (jd) {
    const queueUrl = process.env.SQS_QUEUE_URL;
    if (!queueUrl) {
      console.error("[jobs/POST] SQS_QUEUE_URL is not set — analysis will not run for job", jd.id);
    } else if (!resumeAlreadyExtracted) {
      console.warn("[jobs/POST] Resume not yet extracted for job", jd.id, "— skipping SQS");
    } else {
      const analysisRunId = randomUUID();

      const { error: updateErr } = await supabase
        .from("jobs")
        .update({
          analysis_run_id: analysisRunId,
          analysis_requested_at: new Date().toISOString(),
          fit_score_status: "pending",
          questions_status: "pending",
        })
        .eq("id", jd.id);

      if (updateErr) {
        console.error("[jobs/POST] Failed to stamp analysis_run_id on job", jd.id, updateErr.message);
      } else {
        // Derive region from the queue URL (https://sqs.{region}.amazonaws.com/...)
        const regionMatch = queueUrl.match(/sqs\.([^.]+)\.amazonaws\.com/);
        const region = regionMatch?.[1] ?? process.env.AWS_REGION ?? "us-east-1";

        try {
          const sqs = new SQSClient({ region });
          await sqs.send(
            new SendMessageCommand({
              QueueUrl: queueUrl,
              MessageBody: JSON.stringify({
                job_id: jd.id,
                analysis_run_id: analysisRunId,
                task_type: "BOTH",
                request_id: randomUUID(),
                force: false,
              }),
            }),
          );
          console.log("[jobs/POST] SQS sent for job", jd.id, "run", analysisRunId);
        } catch (sqsErr) {
          console.error("[jobs/POST] SQS send failed for job", jd.id, sqsErr);
        }
      }
    }
  }

  const response = NextResponse.json({ ok: true, job: jd }, { status: 201 });
  applyCookies(response);
  return response;
}

// ---------------------------------------------------------------------------
// GET /api/jobs  –  List jobs for logged-in user
//
// Query params:
//   page      – 1-based page number (default 1)
//   limit     – items per page, max 100 (default 20)
//   resume_id – filter to jobs linked to this resume
//   linked    – "true" = only linked, "false" = only unlinked
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/jobs" });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("jobs")
    .select(JD_LIST_COLUMNS, { count: "exact" })
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })
    .range(from, to);

  // Filter by specific resume
  const resumeIdFilter = url.searchParams.get("resume_id");
  if (resumeIdFilter) {
    query = query.eq("resume_id", resumeIdFilter);
  }

  // Filter linked / unlinked
  const linkedFilter = url.searchParams.get("linked");
  if (linkedFilter === "true") {
    query = query.not("resume_id", "is", null);
  } else if (linkedFilter === "false") {
    query = query.is("resume_id", null);
  }

  const { data: jds, error, count } = await query;

  if (error) {
    return apiError({ error: "Unable to load jobs.", status: 500, route: "/api/jobs", userId: data.user.id, cause: error });
  }

  const response = NextResponse.json({
    ok: true,
    jobs: jds ?? [],
    page,
    limit,
    total: count ?? 0,
  });
  applyCookies(response);
  return response;
}
