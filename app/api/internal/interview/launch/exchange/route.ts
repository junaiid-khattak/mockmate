import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { hashInterviewLaunchCode } from "@/lib/interview-launch-code";
import {
  consumeInterviewCredit,
  verifyInterviewPaywall,
} from "@/lib/interview-paywall";
import {
  getActiveSubscription,
  incrementSubscriptionSession,
  hasSessionsRemaining,
  type CreditSource,
} from "@/lib/subscription";
import { apiError } from "@/lib/posthog/api-error";

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
  credit_source: CreditSource;
  agent_config: Record<string, unknown> | null;
};

const LAUNCH_SELECT_COLUMNS =
  "user_id, job_id, interview_id, duration_seconds, interview_types, language, voice, model, dashboard_return_url, credit_source, agent_config";

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
    return apiError({ error: "Interview launch exchange is not configured.", status: 500, route: "/api/internal/interview/launch/exchange" });
  }

  const bearer = readBearerToken(request.headers.get("authorization"));
  if (!bearer || !secureEquals(bearer, exchangeSecret)) {
    return apiError({ error: "Unauthorized.", status: 401, route: "/api/internal/interview/launch/exchange" });
  }

  const body = await request.json().catch(() => ({}));
  const launchCode =
    typeof body?.launch_code === "string" ? body.launch_code.trim() : "";
  if (!launchCode || launchCode.length < 20 || launchCode.length > 512) {
    return apiError({ error: "Invalid launch code.", status: 400, route: "/api/internal/interview/launch/exchange" });
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
        return apiError({ error: "Launch code is invalid or expired.", status: 401, route: "/api/internal/interview/launch/exchange" });
      }
      return apiError({ error: "Unable to exchange launch code.", status: 500, route: "/api/internal/interview/launch/exchange" });
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Launch code is invalid or expired." },
        { status: 401 },
      );
    }

    // Branch consumption based on credit_source set at interview start
    const creditSource = (data as LaunchCodeRow).credit_source ?? "legacy_credit";

    if (creditSource === "subscription") {
      // Subscription path: re-verify subscription and increment session count
      const sub = await getActiveSubscription(supabase, data.user_id);
      if (!sub || !hasSessionsRemaining(sub)) {
        return apiError({ error: "Subscription session no longer available.", status: 402, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
      }

      const incrementResult = await incrementSubscriptionSession(
        supabase,
        sub.id,
        data.interview_id,
      );

      if (!incrementResult.ok) {
        return apiError({ error: "Unable to consume subscription session.", status: 402, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
      }
    } else if (creditSource === "addon_credit") {
      // Addon credit path: consume agent-scoped credit via RPC
      const agentId =
        typeof (data as LaunchCodeRow).agent_config?.agent_slug === "string"
          ? ((data as LaunchCodeRow).agent_config!.agent_slug as string)
          : null;

      if (!agentId) {
        return apiError({ error: "Missing agent_id for addon credit consumption.", status: 500, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
      }

      const { data: consumed, error: consumeAddonErr } = await supabase.rpc(
        "consume_addon_credit",
        {
          p_user_id: data.user_id,
          p_agent_id: agentId,
          p_interview_id: data.interview_id,
        },
      );

      if (consumeAddonErr || consumed === false) {
        return apiError({ error: "Unable to consume addon credit.", status: 402, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
      }
    } else {
      // Legacy credit / free signup path: use existing credit consumption
      const paywallDecision = await verifyInterviewPaywall(
        supabase,
        data.user_id,
      );
      if (!paywallDecision.ok) {
        if (paywallDecision.code === "verification_failed") {
          return apiError({ error: "Unable to verify interview credit balance.", status: 500, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
        }

        return apiError({ error: paywallDecision.message, status: 402, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
      }

      const consumeDecision = await consumeInterviewCredit(
        supabase,
        data.user_id,
        data.interview_id,
        "interview_start",
      );

      if (!consumeDecision.ok) {
        if (consumeDecision.code === "payment_required") {
          return apiError({ error: consumeDecision.message, status: 402, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
        }

        if (consumeDecision.code !== "interview_already_consumed") {
          return apiError({ error: "Unable to consume interview credit.", status: 500, route: "/api/internal/interview/launch/exchange", userId: data.user_id });
        }
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
        return apiError({ error: "Launch code is invalid or expired.", status: 401, route: "/api/internal/interview/launch/exchange" });
      }
      return apiError({ error: "Unable to exchange launch code.", status: 500, route: "/api/internal/interview/launch/exchange" });
    }

    launchRecord = consumedData as LaunchCodeRow | null;
  } catch (err) {
    return apiError({ error: "Unable to initialize launch exchange.", status: 500, route: "/api/internal/interview/launch/exchange", cause: err });
  }

  if (!launchRecord) {
    return apiError({ error: "Launch code is invalid or expired.", status: 401, route: "/api/internal/interview/launch/exchange" });
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
    agent_config: launchRecord.agent_config ?? undefined,
  };

  return NextResponse.json({
    ok: true,
    interview_id: launchRecord.interview_id,
    expires_at: new Date((now + ttlSeconds) * 1000).toISOString(),
    session_claims: sessionClaims,
    credit_consumption_mode: "start",
  });
}
