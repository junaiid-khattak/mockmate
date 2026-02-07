import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

const MIN_CONTENT_LENGTH = 50;

const JD_COLUMNS =
  "id, title, company, content, source_url, resume_id, fit_score, fit_score_status, fit_score_version, fit_score_error, fit_score_updated_at, fit_strong_alignment, fit_weak_spots, fit_areas_to_probe, analysis_run_id, analysis_requested_at, questions, questions_status, questions_version, questions_error, questions_updated_at, created_at, updated_at";

// ---------------------------------------------------------------------------
// GET /api/jobs/:id  –  Read a single job
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const jobId = context.params.id;
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select(JD_COLUMNS)
    .eq("id", jobId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to load job." }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true, job });
  applyCookies(response);
  return response;
}

// ---------------------------------------------------------------------------
// PATCH /api/jobs/:id  –  Update a job
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const jobId = context.params.id;
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  // Build update object — only include fields that were explicitly provided
  const updates: Record<string, string | null> = {};

  if ("content" in body) {
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        { ok: false, error: `Content must be at least ${MIN_CONTENT_LENGTH} characters.` },
        { status: 400 },
      );
    }
    updates.content = content;
  }

  if ("title" in body) {
    updates.title = typeof body.title === "string" ? body.title.trim() || null : null;
  }

  if ("company" in body) {
    updates.company = typeof body.company === "string" ? body.company.trim() || null : null;
  }

  if ("source_url" in body) {
    updates.source_url = typeof body.source_url === "string" ? body.source_url.trim() || null : null;
  }

  // resume_id: set, change, or clear (null)
  if ("resume_id" in body) {
    if (body.resume_id === null) {
      updates.resume_id = null;
    } else {
      if (typeof body.resume_id !== "string" || !body.resume_id.trim()) {
        return NextResponse.json({ ok: false, error: "Invalid resume_id." }, { status: 400 });
      }
      const candidateResumeId = body.resume_id.trim();

      const { data: resume, error: resumeErr } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", candidateResumeId)
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (resumeErr) {
        return NextResponse.json({ ok: false, error: "Unable to verify resume." }, { status: 500 });
      }
      if (!resume) {
        return NextResponse.json({ ok: false, error: "Resume not found." }, { status: 404 });
      }
      updates.resume_id = candidateResumeId;
    }
  }

  // Reset all analysis state when content or resume_id changes
  if ("content" in updates || "resume_id" in updates) {
    updates.fit_score = null;
    updates.fit_score_status = "pending";
    updates.fit_score_error = null;
    updates.fit_score_version = null;
    updates.fit_strong_alignment = null;
    updates.fit_weak_spots = null;
    updates.fit_areas_to_probe = null;
    updates.questions = null;
    updates.questions_status = "pending";
    updates.questions_error = null;
    updates.questions_version = null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update." }, { status: 400 });
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", jobId)
    .eq("user_id", data.user.id)
    .select(JD_COLUMNS)
    .single();

  if (error) {
    // .single() errors when zero rows match (no row found or not owned)
    if (error.code === "PGRST116") {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update job." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, job });
  applyCookies(response);
  return response;
}

// ---------------------------------------------------------------------------
// DELETE /api/jobs/:id  –  Delete a job
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const jobId = context.params.id;
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const { error, count } = await supabase
    .from("jobs")
    .delete({ count: "exact" })
    .eq("id", jobId)
    .eq("user_id", data.user.id);

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to delete job." }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  applyCookies(response);
  return response;
}
