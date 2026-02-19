import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { hashInterviewLaunchCode } from "@/lib/interview-launch-code";
import {
  consumeInterviewCredit,
  verifyInterviewPaywall,
} from "@/lib/interview-paywall";

const DEFAULT_TOKEN_TTL_SECONDS = 120;
const MIN_TOKEN_TTL_SECONDS = 30;
const MAX_TOKEN_TTL_SECONDS = 600;

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

const LAUNCH_SELECT_COLUMNS =
  "user_id, job_id, interview_id, duration_seconds, interview_types, language, voice, model, dashboard_return_url";

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

export async function POST(request: NextRequest) {
  const exchangeSecret = process.env.INTERVIEW_EXCHANGE_SECRET?.trim() || null;
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
    const supabase = createServiceRoleSupabaseClient();
    const { data, error: lookupErr } = await supabase
      .from("interview_launch_codes")
      .select(LAUNCH_SELECT_COLUMNS)
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (lookupErr) {
      if (isNoRowsError(lookupErr)) {
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

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Launch code is invalid or expired." },
        { status: 401 },
      );
    }

    const paywallDecision = await verifyInterviewPaywall(
      supabase,
      data.user_id,
    );
    if (!paywallDecision.ok) {
      if (paywallDecision.code === "verification_failed") {
        return NextResponse.json(
          { ok: false, error: "Unable to verify interview credit balance." },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "payment_required",
          message: paywallDecision.message,
        },
        { status: 402 },
      );
    }

    const consumeDecision = await consumeInterviewCredit(
      supabase,
      data.user_id,
      data.interview_id,
      "interview_start",
    );

    if (!consumeDecision.ok) {
      if (consumeDecision.code === "payment_required") {
        return NextResponse.json(
          {
            ok: false,
            error: "payment_required",
            message: consumeDecision.message,
          },
          { status: 402 },
        );
      }

      if (consumeDecision.code !== "interview_already_consumed") {
        return NextResponse.json(
          { ok: false, error: "Unable to consume interview credit." },
          { status: 500 },
        );
      }
    }

    const { data: consumedData, error: consumeErr } = await supabase
      .from("interview_launch_codes")
      .update({ used_at: nowIso })
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .select(LAUNCH_SELECT_COLUMNS)
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

    launchRecord = consumedData as LaunchCodeRow | null;
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

  return NextResponse.json({
    ok: true,
    interview_id: launchRecord.interview_id,
    expires_at: new Date((now + ttlSeconds) * 1000).toISOString(),
    session_claims: sessionClaims,
    credit_consumption_mode: "start",
  });
}
