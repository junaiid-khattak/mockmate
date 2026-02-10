import { randomUUID, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { signInterviewSessionToken } from "@/lib/interview-token";
import { hashInterviewLaunchCode } from "@/lib/interview-launch-code";

const DEFAULT_TOKEN_TTL_SECONDS = 120;
const MIN_TOKEN_TTL_SECONDS = 30;
const MAX_TOKEN_TTL_SECONDS = 600;

const DEFAULT_ISSUER = "nayld-dashboard";
const DEFAULT_AUDIENCE = "nayld-interview-worker";

type LaunchCodeRow = {
  user_id: string;
  job_id: string;
  interview_id: string;
  duration_seconds: number | null;
  interview_types: unknown;
  language: string | null;
  voice: string | null;
  model: string | null;
  dashboard_return_url: string | null;
};

function isNoRowsError(error: {
  code?: string;
  message?: string;
  details?: string | null;
}): boolean {
  if (error.code === "PGRST116") return true;
  const combined = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return combined.includes("0 rows");
}

function readBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.trim().split(/\s+/, 2);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

function secureEquals(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

function parseTokenTtlSeconds(): number {
  const raw = Number(
    process.env.INTERVIEW_SESSION_TOKEN_TTL_SECONDS ?? DEFAULT_TOKEN_TTL_SECONDS,
  );
  if (!Number.isFinite(raw)) return DEFAULT_TOKEN_TTL_SECONDS;
  return Math.min(MAX_TOKEN_TTL_SECONDS, Math.max(MIN_TOKEN_TTL_SECONDS, Math.floor(raw)));
}

async function createLaunchExchangeSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return createServiceRoleSupabaseClient();
}

export async function POST(request: NextRequest) {
  const exchangeSecret = process.env.INTERVIEW_EXCHANGE_SECRET;
  const interviewJwtSecret = process.env.INTERVIEW_JWT_SECRET?.trim() || null;
  if (!exchangeSecret) {
    return NextResponse.json(
      { ok: false, error: "Interview launch exchange is not configured." },
      { status: 500 },
    );
  }

  const bearer = readBearerToken(request.headers.get("authorization"));
  if (!bearer || !secureEquals(bearer, exchangeSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const launchCode =
    typeof body?.launch_code === "string" ? body.launch_code.trim() : "";
  if (!launchCode || launchCode.length < 20 || launchCode.length > 512) {
    return NextResponse.json({ ok: false, error: "Invalid launch code." }, { status: 400 });
  }

  const codeHash = hashInterviewLaunchCode(launchCode);
  const nowIso = new Date().toISOString();
  let launchRecord: LaunchCodeRow | null = null;
  try {
    const supabase = await createLaunchExchangeSupabaseClient();
    const { data, error: consumeErr } = await supabase
      .from("interview_launch_codes")
      .update({ used_at: nowIso })
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .select(
        "user_id, job_id, interview_id, duration_seconds, interview_types, language, voice, model, dashboard_return_url",
      )
      .maybeSingle();

    if (consumeErr) {
      if (isNoRowsError(consumeErr)) {
        return NextResponse.json(
          { ok: false, error: "Launch code is invalid or expired." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { ok: false, error: "Unable to exchange launch code." },
        { status: 500 },
      );
    }

    launchRecord = data as LaunchCodeRow | null;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to initialize launch exchange." },
      { status: 500 },
    );
  }

  if (!launchRecord) {
    return NextResponse.json(
      { ok: false, error: "Launch code is invalid or expired." },
      { status: 401 },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = parseTokenTtlSeconds();
  const issuer = process.env.INTERVIEW_SESSION_ISSUER ?? DEFAULT_ISSUER;
  const audience = process.env.INTERVIEW_SESSION_AUDIENCE ?? DEFAULT_AUDIENCE;
  const interviewTypes = Array.isArray(launchRecord.interview_types)
    ? launchRecord.interview_types
        .filter((entry) => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : undefined;
  const sessionClaims = {
    user_id: launchRecord.user_id,
    job_id: launchRecord.job_id,
    interview_id: launchRecord.interview_id,
    duration_seconds: launchRecord.duration_seconds ?? undefined,
    interview_types:
      interviewTypes && interviewTypes.length > 0 ? interviewTypes : undefined,
    language: launchRecord.language ?? undefined,
    voice: launchRecord.voice ?? undefined,
    model: launchRecord.model ?? undefined,
    dashboard_return_url: launchRecord.dashboard_return_url ?? undefined,
  };

  let sessionToken: string | null = null;
  if (interviewJwtSecret) {
    sessionToken = signInterviewSessionToken(
      {
        iss: issuer,
        aud: audience,
        sub: launchRecord.user_id,
        iat: now,
        nbf: now - 5,
        exp: now + ttlSeconds,
        jti: randomUUID(),
        user_id: launchRecord.user_id,
        job_id: launchRecord.job_id,
        interview_id: launchRecord.interview_id,
        duration_seconds: launchRecord.duration_seconds ?? undefined,
        interview_types:
          interviewTypes && interviewTypes.length > 0
            ? interviewTypes
            : undefined,
        language: launchRecord.language ?? undefined,
        voice: launchRecord.voice ?? undefined,
        model: launchRecord.model ?? undefined,
        dashboard_return_url: launchRecord.dashboard_return_url ?? undefined,
      },
      interviewJwtSecret,
    );
  }

  return NextResponse.json({
    ok: true,
    interview_id: launchRecord.interview_id,
    expires_at: new Date((now + ttlSeconds) * 1000).toISOString(),
    session_claims: sessionClaims,
    session_token: sessionToken ?? undefined,
  });
}
