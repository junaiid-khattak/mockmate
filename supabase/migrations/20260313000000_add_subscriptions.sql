-- Migration: Subscription Billing Model
-- Adds subscriptions table, session log, credit_source column, and RPCs

-- ============================================================
-- Table: subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro_monthly',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  sessions_limit INTEGER NOT NULL DEFAULT 4,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One active subscription per user
CREATE UNIQUE INDEX idx_subscriptions_user_active
  ON subscriptions(user_id)
  WHERE status IN ('active', 'past_due', 'trialing');

-- Lookup by Stripe subscription ID (webhook handler)
CREATE INDEX idx_subscriptions_stripe_id
  ON subscriptions(stripe_subscription_id);

-- ============================================================
-- Table: subscription_session_log
-- ============================================================
CREATE TABLE subscription_session_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL UNIQUE,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_log_subscription
  ON subscription_session_log(subscription_id);

-- ============================================================
-- Alter: interview_launch_codes — add credit_source column
-- ============================================================
ALTER TABLE interview_launch_codes
  ADD COLUMN credit_source TEXT NOT NULL DEFAULT 'legacy_credit';

-- ============================================================
-- RPC: get_active_subscription
-- ============================================================
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan TEXT,
  status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  sessions_limit INTEGER,
  sessions_used INTEGER,
  cancel_at_period_end BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id, s.stripe_subscription_id, s.stripe_customer_id, s.plan, s.status,
    s.current_period_start, s.current_period_end,
    s.sessions_limit, s.sessions_used, s.cancel_at_period_end
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'past_due')
    AND s.current_period_end > now()
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_active_subscription(UUID) TO authenticated, service_role;

-- ============================================================
-- RPC: increment_subscription_sessions_used
-- ============================================================
CREATE OR REPLACE FUNCTION increment_subscription_sessions_used(
  p_subscription_id UUID,
  p_interview_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted BOOLEAN := FALSE;
BEGIN
  -- Idempotent: if this interview_id already logged, do nothing
  INSERT INTO subscription_session_log (subscription_id, interview_id)
  VALUES (p_subscription_id, p_interview_id)
  ON CONFLICT (interview_id) DO NOTHING;

  IF FOUND THEN
    UPDATE subscriptions
    SET sessions_used = sessions_used + 1,
        updated_at = now()
    WHERE id = p_subscription_id
      AND sessions_used < sessions_limit;

    v_inserted := FOUND;
  END IF;

  RETURN v_inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_subscription_sessions_used(UUID, UUID) TO service_role;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE subscription_session_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscription_session_log"
  ON subscription_session_log FOR ALL
  USING (auth.role() = 'service_role');
