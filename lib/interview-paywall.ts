type RpcResult = {
  data: unknown;
  error: { message?: string } | null;
};

type PaywallSupabaseClient = {
  rpc: (
    fn: "get_interview_credit_balance" | "consume_interview_credit",
    args: Record<string, unknown>,
  ) => PromiseLike<RpcResult>;
};

export type InterviewCreditConsumptionMode = "start" | "complete";

export type InterviewPaywallDecision =
  | {
      ok: true;
      availableCredits: number;
    }
  | {
      ok: false;
      code: "payment_required" | "verification_failed";
      message: string;
      availableCredits?: number;
    };

export type InterviewCreditConsumptionDecision =
  | {
      ok: true;
      balanceAfter: number | null;
    }
  | {
      ok: false;
      code:
        | "payment_required"
        | "verification_failed"
        | "interview_already_consumed"
        | "invalid_request";
      message: string;
      balanceAfter?: number | null;
    };

export const PAYMENT_REQUIRED_MESSAGE =
  "You need at least one available interview credit to start an interview.";

function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed);
    }
  }
  return null;
}

function coerceConsumptionRow(payload: unknown): {
  ok: boolean;
  errorCode: string | null;
  balanceAfter: number | null;
} | null {
  const row =
    Array.isArray(payload) && payload.length > 0
      ? payload[0]
      : payload && typeof payload === "object"
        ? payload
        : null;

  if (!row || typeof row !== "object") return null;
  const asRecord = row as Record<string, unknown>;
  if (typeof asRecord.ok !== "boolean") return null;

  const errorCode =
    typeof asRecord.error_code === "string" && asRecord.error_code.trim()
      ? asRecord.error_code.trim()
      : null;

  return {
    ok: asRecord.ok,
    errorCode,
    balanceAfter: parseInteger(asRecord.balance_after),
  };
}

export function readInterviewCreditConsumptionMode(): InterviewCreditConsumptionMode {
  const raw = (process.env.INTERVIEW_CREDIT_CONSUMPTION_MODE ?? "start")
    .trim()
    .toLowerCase();
  return raw === "complete" ? "complete" : "start";
}

export async function getInterviewCreditBalance(
  supabase: PaywallSupabaseClient,
  userId: string,
): Promise<{ ok: true; balance: number } | { ok: false; message: string }> {
  const { data, error } = await supabase.rpc("get_interview_credit_balance", {
    p_user_id: userId,
  });

  if (error) {
    return {
      ok: false,
      message: "Unable to verify interview credit balance.",
    };
  }

  const balance = parseInteger(data) ?? 0;
  return { ok: true, balance: Math.max(0, balance) };
}

export async function verifyInterviewPaywall(
  supabase: PaywallSupabaseClient,
  userId: string,
): Promise<InterviewPaywallDecision> {
  const balanceResult = await getInterviewCreditBalance(supabase, userId);
  if (!balanceResult.ok) {
    return {
      ok: false,
      code: "verification_failed",
      message: balanceResult.message,
    };
  }

  if (balanceResult.balance < 1) {
    return {
      ok: false,
      code: "payment_required",
      message: PAYMENT_REQUIRED_MESSAGE,
      availableCredits: balanceResult.balance,
    };
  }

  return { ok: true, availableCredits: balanceResult.balance };
}

export async function consumeInterviewCredit(
  supabase: PaywallSupabaseClient,
  userId: string,
  interviewId: string,
  reason: "interview_start" | "interview_complete",
): Promise<InterviewCreditConsumptionDecision> {
  const { data, error } = await supabase.rpc("consume_interview_credit", {
    p_user_id: userId,
    p_interview_id: interviewId,
    p_reason: reason,
  });

  if (error) {
    return {
      ok: false,
      code: "verification_failed",
      message: "Unable to consume interview credit.",
    };
  }

  const row = coerceConsumptionRow(data);
  if (!row) {
    return {
      ok: false,
      code: "verification_failed",
      message: "Invalid credit consumption response.",
    };
  }

  if (row.ok) {
    return { ok: true, balanceAfter: row.balanceAfter };
  }

  if (row.errorCode === "insufficient_credits") {
    return {
      ok: false,
      code: "payment_required",
      message: PAYMENT_REQUIRED_MESSAGE,
      balanceAfter: row.balanceAfter,
    };
  }

  if (row.errorCode === "interview_already_consumed") {
    return {
      ok: false,
      code: "interview_already_consumed",
      message: "This interview credit has already been consumed.",
      balanceAfter: row.balanceAfter,
    };
  }

  return {
    ok: false,
    code: "invalid_request",
    message: "Unable to consume interview credit.",
    balanceAfter: row.balanceAfter,
  };
}
