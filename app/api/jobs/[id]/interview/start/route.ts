import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { signInterviewSessionToken } from "@/lib/interview-token";
import { getAppUrl } from "@/lib/supabase/app-url";

const MIN_DURATION_SECONDS = 300;
const MAX_DURATION_SECONDS = 7200;
const DEFAULT_DURATION_SECONDS = 1800;

const DEFAULT_TOKEN_TTL_SECONDS = 120;
const MIN_TOKEN_TTL_SECONDS = 30;
const MAX_TOKEN_TTL_SECONDS = 600;

const DEFAULT_ISSUER = "nayld-dashboard";
const DEFAULT_AUDIENCE = "nayld-interview-worker";

function parseDurationSeconds(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const intValue = Math.floor(parsed);
  if (intValue < MIN_DURATION_SECONDS || intValue > MAX_DURATION_SECONDS) return null;
  return intValue;
}

function parseInterviewTypes(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 2 && entry.length <= 64)
    .slice(0, 8);
  return cleaned.length > 0 ? cleaned : undefined;
}

function parseOptionalString(value: unknown, minLength = 2, maxLength = 80): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) return undefined;
  return trimmed;
}

function parseTokenTtlSeconds(): number {
  const raw = Number(process.env.INTERVIEW_SESSION_TOKEN_TTL_SECONDS ?? DEFAULT_TOKEN_TTL_SECONDS);
  if (!Number.isFinite(raw)) return DEFAULT_TOKEN_TTL_SECONDS;
  return Math.min(MAX_TOKEN_TTL_SECONDS, Math.max(MIN_TOKEN_TTL_SECONDS, Math.floor(raw)));
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const interviewAppUrl = process.env.INTERVIEW_APP_URL;
  const interviewJwtSecret = process.env.INTERVIEW_JWT_SECRET;
  if (!interviewAppUrl || !interviewJwtSecret) {
    return NextResponse.json(
      { ok: false, error: "Interview service is not configured." },
      { status: 500 },
    );
  }

  const jobId = context.params.id;
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Missing job id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  const durationSeconds =
    parseDurationSeconds(body?.duration_seconds) ?? DEFAULT_DURATION_SECONDS;
  const interviewTypes = parseInterviewTypes(body?.interview_types);
  const language = parseOptionalString(body?.language, 2, 16);
  const voice = parseOptionalString(body?.voice, 2, 64);
  const model = parseOptionalString(body?.model, 2, 64);

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id, user_id, resume_id")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (jobErr) {
    return NextResponse.json({ ok: false, error: "Unable to load job." }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  if (!job.resume_id) {
    return NextResponse.json(
      { ok: false, error: "Attach a resume before starting an interview." },
      { status: 400 },
    );
  }

  const { data: resume, error: resumeErr } = await supabase
    .from("resumes")
    .select("id, extracted_text_status")
    .eq("id", job.resume_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (resumeErr) {
    return NextResponse.json({ ok: false, error: "Unable to verify resume." }, { status: 500 });
  }

  if (!resume) {
    return NextResponse.json({ ok: false, error: "Resume not found." }, { status: 404 });
  }

  if (resume.extracted_text_status !== "successful") {
    return NextResponse.json(
      {
        ok: false,
        error: "Resume parsing is not complete yet. Try again in a moment.",
      },
      { status: 409 },
    );
  }

  const interviewId = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = parseTokenTtlSeconds();
  const issuer = process.env.INTERVIEW_SESSION_ISSUER ?? DEFAULT_ISSUER;
  const audience = process.env.INTERVIEW_SESSION_AUDIENCE ?? DEFAULT_AUDIENCE;

  const token = signInterviewSessionToken(
    {
      iss: issuer,
      aud: audience,
      sub: user.id,
      iat: now,
      nbf: now - 5,
      exp: now + ttlSeconds,
      jti: randomUUID(),
      user_id: user.id,
      job_id: job.id,
      interview_id: interviewId,
      duration_seconds: durationSeconds,
      interview_types: interviewTypes,
      language,
      voice,
      model,
      dashboard_return_url: `${getAppUrl(request)}/jobs/${job.id}`,
    },
    interviewJwtSecret,
  );

  let launchUrl: string;
  try {
    const url = new URL("/", interviewAppUrl);
    url.searchParams.set("token", token);
    launchUrl = url.toString();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid INTERVIEW_APP_URL configuration." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    interview_id: interviewId,
    launch_url: launchUrl,
    expires_at: new Date((now + ttlSeconds) * 1000).toISOString(),
  });
  applyCookies(response);
  return response;
}
