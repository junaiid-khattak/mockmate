import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  createRouteHandlerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { createInterviewLaunchCode } from "@/lib/interview-launch-code";
import { verifyInterviewPaywallV2 } from "@/lib/interview-paywall";
import { getAppUrl } from "@/lib/supabase/app-url";

const MIN_DURATION_SECONDS = 1800;
const MAX_DURATION_SECONDS = 2700;
const DEFAULT_DURATION_SECONDS = 1800;

const DEFAULT_LAUNCH_CODE_TTL_SECONDS = 120;
const MIN_LAUNCH_CODE_TTL_SECONDS = 30;
const MAX_LAUNCH_CODE_TTL_SECONDS = 600;

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

function parseLaunchCodeTtlSeconds(): number {
  const raw = Number(
    process.env.INTERVIEW_LAUNCH_CODE_TTL_SECONDS ??
    process.env.INTERVIEW_SESSION_TOKEN_TTL_SECONDS ??
    DEFAULT_LAUNCH_CODE_TTL_SECONDS,
  );
  if (!Number.isFinite(raw)) return DEFAULT_LAUNCH_CODE_TTL_SECONDS;
  return Math.min(
    MAX_LAUNCH_CODE_TTL_SECONDS,
    Math.max(MIN_LAUNCH_CODE_TTL_SECONDS, Math.floor(raw)),
  );
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

  const interviewAppUrl = process.env.INTERVIEW_APP_URL?.trim() || null;
  const interviewExchangeSecret = process.env.INTERVIEW_EXCHANGE_SECRET?.trim() || null;

  if (!interviewAppUrl || !interviewExchangeSecret) {
    const missing: string[] = [];
    if (!interviewAppUrl) missing.push("INTERVIEW_APP_URL");
    if (!interviewExchangeSecret) missing.push("INTERVIEW_EXCHANGE_SECRET");
    console.error("Interview service is not configured", { missing });
    return NextResponse.json(
      { ok: false, error: "Interview service is not configured.", missing },
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

  const paywallDecision = await verifyInterviewPaywallV2(supabase, user.id);
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
        has_subscription: paywallDecision.has_subscription,
        subscription_expired: paywallDecision.subscription_expired,
        sessions_exhausted: paywallDecision.sessions_exhausted,
        renewal_date: paywallDecision.renewal_date,
        legacy_credits: paywallDecision.legacy_credits,
        addon_credits: paywallDecision.addon_credits,
        credit_price_cents: paywallDecision.credit_price_cents,
        can_buy_credits: paywallDecision.can_buy_credits,
      },
      { status: 402 },
    );
  }

  // Resolve interview agent based on user's subscription plan
  const serviceSupabase = createServiceRoleSupabaseClient();
  const { data: agentRows, error: agentErr } = await serviceSupabase.rpc(
    "get_interview_agent_for_user",
    { p_user_id: user.id },
  );

  if (agentErr) {
    console.error("Failed to resolve interview agent", agentErr);
    return NextResponse.json(
      { ok: false, error: "Unable to resolve interview agent." },
      { status: 500 },
    );
  }

  const agentRow = Array.isArray(agentRows) ? agentRows[0] : agentRows;
  if (!agentRow || typeof agentRow !== "object" || !(agentRow as Record<string, unknown>).agent_id) {
    return NextResponse.json(
      { ok: false, error: "No interview agent configured for your plan." },
      { status: 500 },
    );
  }

  const agentConfig = agentRow as Record<string, unknown>;

  const interviewId = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = parseLaunchCodeTtlSeconds();
  const expiresAtIso = new Date((now + ttlSeconds) * 1000).toISOString();
  const dashboardReturnUrl = new URL(`/jobs/${job.id}`, getAppUrl(request));
  dashboardReturnUrl.searchParams.set("interview_id", interviewId);
  const { code: launchCode, codeHash } = createInterviewLaunchCode();

  const { error: launchCodeErr } = await supabase
    .from("interview_launch_codes")
    .insert({
      code_hash: codeHash,
      user_id: user.id,
      job_id: job.id,
      interview_id: interviewId,
      duration_seconds: durationSeconds,
      interview_types: interviewTypes ?? null,
      language: language ?? null,
      voice: voice ?? (typeof agentConfig.voice === "string" ? agentConfig.voice : null),
      model: model ?? (typeof agentConfig.realtime_model === "string" ? agentConfig.realtime_model : null),
      dashboard_return_url: dashboardReturnUrl.toString(),
      expires_at: expiresAtIso,
      used_at: null,
      credit_source: paywallDecision.creditSource,
      agent_config: agentConfig,
    });

  if (launchCodeErr) {
    return NextResponse.json(
      { ok: false, error: "Unable to create interview launch session." },
      { status: 500 },
    );
  }

  let launchUrl: string;
  try {
    const url = new URL("/", interviewAppUrl);
    url.searchParams.set("launch_code", launchCode);
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
    expires_at: expiresAtIso,
  });
  applyCookies(response);
  return response;
}
