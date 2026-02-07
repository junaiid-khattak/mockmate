import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

const MIN_CONTENT_LENGTH = 50;

// ---------------------------------------------------------------------------
// POST /api/job-descriptions  –  Create a new job description
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length < MIN_CONTENT_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Content is required and must be at least ${MIN_CONTENT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() || null : null;
  const company = typeof body.company === "string" ? body.company.trim() || null : null;
  const sourceUrl = typeof body.source_url === "string" ? body.source_url.trim() || null : null;

  const { data: jd, error } = await supabase
    .from("job_descriptions")
    .insert({
      user_id: data.user.id,
      title,
      company,
      content,
      source_url: sourceUrl,
    })
    .select("id, title, company, content, source_url, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to create job description." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, job_description: jd }, { status: 201 });
  applyCookies(response);
  return response;
}

// ---------------------------------------------------------------------------
// GET /api/job-descriptions  –  List job descriptions for logged-in user
//
// Query params:
//   page   – 1-based page number (default 1)
//   limit  – items per page, max 100 (default 20)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: jds, error, count } = await supabase
    .from("job_descriptions")
    .select("id, title, company, source_url, created_at, updated_at", { count: "exact" })
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to load job descriptions." }, { status: 500 });
  }

  const response = NextResponse.json({
    ok: true,
    job_descriptions: jds ?? [],
    page,
    limit,
    total: count ?? 0,
  });
  applyCookies(response);
  return response;
}
