import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import {
  consumeInterviewCredit,
  readInterviewCreditConsumptionMode,
} from "@/lib/interview-paywall";

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

export async function POST(request: NextRequest) {
  const exchangeSecret = process.env.INTERVIEW_EXCHANGE_SECRET?.trim() || null;
  if (!exchangeSecret) {
    return NextResponse.json(
      { ok: false, error: "Interview credit consume endpoint is not configured." },
      { status: 500 },
    );
  }

  const bearer = readBearerToken(request.headers.get("authorization"));
  if (!bearer || !secureEquals(bearer, exchangeSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
  const interviewId =
    typeof body?.interview_id === "string" ? body.interview_id.trim() : "";
  const reasonRaw = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!userId || !interviewId) {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const mode = readInterviewCreditConsumptionMode();
  if (mode !== "complete") {
    return NextResponse.json({
      ok: true,
      consumed: false,
      mode,
      reason: "consumption_mode_not_complete",
    });
  }

  const reason = reasonRaw === "interview_start" ? "interview_start" : "interview_complete";
  const supabase = createServiceRoleSupabaseClient();
  const consumeDecision = await consumeInterviewCredit(
    supabase,
    userId,
    interviewId,
    reason,
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

    if (consumeDecision.code === "interview_already_consumed") {
      return NextResponse.json({
        ok: true,
        consumed: false,
        mode,
        reason: "already_consumed",
        balance_after: consumeDecision.balanceAfter ?? null,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Unable to consume interview credit." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    consumed: true,
    mode,
    balance_after: consumeDecision.balanceAfter,
  });
}
