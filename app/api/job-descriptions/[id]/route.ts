import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

const MIN_CONTENT_LENGTH = 50;

// ---------------------------------------------------------------------------
// GET /api/job-descriptions/:id  –  Read a single job description
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const jdId = context.params.id;
  if (!jdId) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const { data: jd, error } = await supabase
    .from("job_descriptions")
    .select("id, title, company, content, source_url, created_at, updated_at")
    .eq("id", jdId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to load job description." }, { status: 500 });
  }

  if (!jd) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true, job_description: jd });
  applyCookies(response);
  return response;
}

// ---------------------------------------------------------------------------
// PATCH /api/job-descriptions/:id  –  Update a job description
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const jdId = context.params.id;
  if (!jdId) {
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

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update." }, { status: 400 });
  }

  const { data: jd, error } = await supabase
    .from("job_descriptions")
    .update(updates)
    .eq("id", jdId)
    .eq("user_id", data.user.id)
    .select("id, title, company, content, source_url, created_at, updated_at")
    .single();

  if (error) {
    // .single() errors when zero rows match (no row found or not owned)
    if (error.code === "PGRST116") {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update job description." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, job_description: jd });
  applyCookies(response);
  return response;
}

// ---------------------------------------------------------------------------
// DELETE /api/job-descriptions/:id  –  Delete a job description
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const jdId = context.params.id;
  if (!jdId) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const { error, count } = await supabase
    .from("job_descriptions")
    .delete({ count: "exact" })
    .eq("id", jdId)
    .eq("user_id", data.user.id);

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to delete job description." }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  applyCookies(response);
  return response;
}
