import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { buildResumeKey, getResumeBucket, getS3Client } from "@/lib/s3/client";

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
  if (!body || typeof body.filename !== "string" || typeof body.contentType !== "string") {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const sizeBytes = Number(body.sizeBytes);
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_SIZE_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(body.contentType)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type." }, { status: 400 });
  }

  const bucket = getResumeBucket();
  const storageKey = buildResumeKey(data.user.id, body.filename);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: body.contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 600 });

  return NextResponse.json({
    ok: true,
    uploadUrl,
    storageKey,
    bucket,
    storageProvider: "s3",
  });
}
