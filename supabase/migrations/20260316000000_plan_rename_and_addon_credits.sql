-- Migration: Rename plans (starter→essentials, pro→elite, remove power)
-- and add addon credit tables with agent-scoped RPCs.

-- ============================================================
-- 1. Rename plan IDs in subscriptions
-- ============================================================
UPDATE subscriptions SET plan = 'essentials_monthly' WHERE plan = 'starter_monthly';
UPDATE subscriptions SET plan = 'elite_monthly' WHERE plan = 'pro_monthly';
UPDATE subscriptions SET plan = 'elite_monthly' WHERE plan = 'power_monthly';

-- ============================================================
-- 2. Update subscription_plan_agents mappings
-- ============================================================
DELETE FROM subscription_plan_agents WHERE plan IN ('starter_monthly', 'pro_monthly', 'power_monthly');

INSERT INTO subscription_plan_agents (plan, agent_id)
  SELECT 'essentials_monthly', id FROM interview_agents WHERE slug = 'standard'
  ON CONFLICT (plan) DO NOTHING;

INSERT INTO subscription_plan_agents (plan, agent_id)
  SELECT 'elite_monthly', id FROM interview_agents WHERE slug = 'premium'
  ON CONFLICT (plan) DO NOTHING;

-- ============================================================
-- 3. Update get_interview_agent_for_user to reflect new plans
--    (no schema change needed — it joins on subscription.plan)
-- ============================================================

-- ============================================================
-- 4. Create addon_credits table (agent-scoped balances)
-- ============================================================
CREATE TABLE IF NOT EXISTS addon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT addon_credits_user_agent_unique UNIQUE(user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_addon_credits_user ON addon_credits(user_id);

ALTER TABLE addon_credits ENABLE ROW LEVEL SECURITY;
-- Service-role only — no user-facing RLS policies

-- ============================================================
-- 5. Create addon_credit_grants table (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS addon_credit_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  grant_key TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL DEFAULT 'stripe_purchase',
  stripe_session_id TEXT,
  interview_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addon_credit_grants_user ON addon_credit_grants(user_id);

ALTER TABLE addon_credit_grants ENABLE ROW LEVEL SECURITY;
-- Service-role only — no user-facing RLS policies

-- ============================================================
-- 6. RPC: grant_addon_credits (idempotent via grant_key)
-- ============================================================
CREATE OR REPLACE FUNCTION grant_addon_credits(
  p_user_id UUID,
  p_agent_id TEXT,
  p_credits INTEGER,
  p_grant_key TEXT,
  p_reason TEXT DEFAULT 'stripe_purchase',
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Idempotent: skip if grant_key already used
  INSERT INTO addon_credit_grants (user_id, agent_id, credits, grant_key, reason, stripe_session_id)
  VALUES (p_user_id, p_agent_id, p_credits, p_grant_key, p_reason, p_stripe_session_id)
  ON CONFLICT (grant_key) DO NOTHING;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Upsert credit balance scoped to agent
  INSERT INTO addon_credits (user_id, agent_id, credits_remaining)
  VALUES (p_user_id, p_agent_id, p_credits)
  ON CONFLICT (user_id, agent_id) DO UPDATE
  SET credits_remaining = addon_credits.credits_remaining + p_credits,
      updated_at = now();

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION grant_addon_credits(UUID, TEXT, INTEGER, TEXT, TEXT, TEXT) TO service_role;

-- ============================================================
-- 7. RPC: consume_addon_credit (idempotent via grant_key)
-- ============================================================
CREATE OR REPLACE FUNCTION consume_addon_credit(
  p_user_id UUID,
  p_agent_id TEXT,
  p_interview_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Idempotent consumption via grant_key
  INSERT INTO addon_credit_grants (user_id, agent_id, credits, grant_key, reason, interview_id)
  VALUES (p_user_id, p_agent_id, -1, 'consume_addon_' || p_interview_id::TEXT, 'consumed', p_interview_id)
  ON CONFLICT (grant_key) DO NOTHING;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Decrement balance for correct agent
  UPDATE addon_credits
  SET credits_remaining = credits_remaining - 1,
      updated_at = now()
  WHERE user_id = p_user_id
    AND agent_id = p_agent_id
    AND credits_remaining > 0;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION consume_addon_credit(UUID, TEXT, UUID) TO service_role;

-- ============================================================
-- 8. RPC: get_addon_credit_balance
-- ============================================================
CREATE OR REPLACE FUNCTION get_addon_credit_balance(p_user_id UUID, p_agent_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(credits_remaining, 0)
  FROM addon_credits
  WHERE user_id = p_user_id AND agent_id = p_agent_id;
$$;

GRANT EXECUTE ON FUNCTION get_addon_credit_balance(UUID, TEXT) TO service_role;
