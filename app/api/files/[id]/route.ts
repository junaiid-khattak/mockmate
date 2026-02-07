import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const resumeId = context.params.id;
  if (!resumeId) {
    return NextResponse.json({ ok: false, error: "Missing resume id." }, { status: 400 });
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("id, original_filename, extracted_text_status, extracted_text_error")
    .eq("id", resumeId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to load resume." }, { status: 500 });
  }

  if (!resume) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    resumeId: resume.id,
    filename: resume.original_filename,
    extractedTextStatus: resume.extracted_text_status,
    extractedTextError: resume.extracted_text_error,
  });
}
