import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { getResumeBucket } from "@/lib/s3/client";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export async function POST(request: NextRequest) {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const storageKey = typeof body.storageKey === "string" ? body.storageKey : "";
  const bucket = typeof body.bucket === "string" ? body.bucket : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const originalFilename = typeof body.originalFilename === "string" ? body.originalFilename : "";
  const sizeBytes = Number(body.sizeBytes);

  if (!storageKey || !bucket || !contentType || !originalFilename) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_SIZE_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type." }, { status: 400 });
  }

  const expectedPrefix = `resumes/${data.user.id}/`;
  if (!storageKey.startsWith(expectedPrefix)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const envBucket = getResumeBucket();
  if (bucket !== envBucket) {
    return NextResponse.json({ ok: false, error: "Invalid bucket." }, { status: 400 });
  }

  const { data: fileRow, error: insertError } = await supabase
    .from("files")
    .insert({
      user_id: data.user.id,
      kind: "resume",
      storage_provider: "s3",
      bucket,
      storage_key: storageKey,
      mime_type: contentType,
      size_bytes: sizeBytes,
      original_filename: originalFilename,
      extracted_text_status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !fileRow) {
    return NextResponse.json({ ok: false, error: "Unable to store file metadata." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    fileId: fileRow.id,
    extractedTextStatus: "pending",
  });
}
