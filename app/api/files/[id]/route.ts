import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/posthog/api-error";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/files/[id]" });
  }

  const resumeId = context.params.id;
  if (!resumeId) {
    return apiError({ error: "Missing resume id.", status: 400, route: "/api/files/[id]" });
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("id, original_filename, extracted_text_status, extracted_text_error")
    .eq("id", resumeId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (error) {
    return apiError({ error: "Unable to load resume.", status: 500, route: "/api/files/[id]", userId: data.user.id, cause: error });
  }

  if (!resume) {
    return apiError({ error: "Not found", status: 404, route: "/api/files/[id]", userId: data.user.id });
  }

  return NextResponse.json({
    ok: true,
    resumeId: resume.id,
    filename: resume.original_filename,
    extractedTextStatus: resume.extracted_text_status,
    extractedTextError: resume.extracted_text_error,
  });
}
