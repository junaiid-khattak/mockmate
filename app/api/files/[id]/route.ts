import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const fileId = context.params.id;
  if (!fileId) {
    return NextResponse.json({ ok: false, error: "Missing file id" }, { status: 400 });
  }

  const { data: file, error } = await supabase
    .from("files")
    .select("id, original_filename, extracted_text_status, extracted_text_error")
    .eq("id", fileId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "Unable to load file." }, { status: 500 });
  }

  if (!file) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    fileId: file.id,
    filename: file.original_filename,
    extractedTextStatus: file.extracted_text_status,
    extractedTextError: file.extracted_text_error,
  });
}
