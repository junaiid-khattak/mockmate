import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/posthog/api-error";

// ---------------------------------------------------------------------------
// GET /api/resumes  –  List resumes for the logged-in user
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/resumes" });
  }

  const { data: resumes, error } = await supabase
    .from("resumes")
    .select("id, original_filename, created_at")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError({ error: "Unable to load resumes.", status: 500, route: "/api/resumes", userId: data.user.id, cause: error });
  }

  const response = NextResponse.json({ ok: true, resumes: resumes ?? [] });
  applyCookies(response);
  return response;
}
