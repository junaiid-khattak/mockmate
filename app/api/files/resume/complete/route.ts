import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { getResumeBucket } from "@/lib/s3/client";
import { apiError } from "@/lib/posthog/api-error";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export async function POST(request: NextRequest) {
  const { supabase } = createRouteHandlerSupabaseClient(request);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return apiError({ error: "Unauthorized", status: 401, route: "/api/files/resume/complete" });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError({ error: "Invalid payload.", status: 400, route: "/api/files/resume/complete", userId: data.user.id });
  }

  const storageKey = typeof body.storageKey === "string" ? body.storageKey : "";
  const bucket = typeof body.bucket === "string" ? body.bucket : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const originalFilename = typeof body.originalFilename === "string" ? body.originalFilename : "";
  const sizeBytes = Number(body.sizeBytes);

  if (!storageKey || !bucket || !contentType || !originalFilename) {
    return apiError({ error: "Invalid payload.", status: 400, route: "/api/files/resume/complete", userId: data.user.id });
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_SIZE_BYTES) {
    return apiError({ error: "File too large.", status: 400, route: "/api/files/resume/complete", userId: data.user.id });
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return apiError({ error: "Unsupported file type.", status: 400, route: "/api/files/resume/complete", userId: data.user.id });
  }

  const expectedPrefix = `resumes/${data.user.id}/`;
  if (!storageKey.startsWith(expectedPrefix)) {
    return apiError({ error: "Unauthorized", status: 403, route: "/api/files/resume/complete", userId: data.user.id });
  }

  const envBucket = getResumeBucket();
  if (bucket !== envBucket) {
    return apiError({ error: "Invalid bucket.", status: 400, route: "/api/files/resume/complete", userId: data.user.id });
  }

  const { data: resumeRow, error: insertError } = await supabase
    .from("resumes")
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

  if (insertError || !resumeRow) {
    return apiError({ error: "Unable to store resume metadata.", status: 500, route: "/api/files/resume/complete", userId: data.user.id, cause: insertError });
  }

  return NextResponse.json({
    ok: true,
    resumeId: resumeRow.id,
    extractedTextStatus: "pending",
  });
}
