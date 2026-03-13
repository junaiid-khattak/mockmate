-- Migration: Free Subscription Support
-- Allows free-tier subscriptions (no Stripe) and a helper RPC for signup.

-- ============================================================
-- RPC: create_free_subscription
-- Idempotent: does nothing if user already has an active sub.
-- ============================================================
CREATE OR REPLACE FUNCTION create_free_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Check if user already has any active subscription
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND status IN ('active', 'past_due', 'trialing')
  ) INTO v_exists;

  IF v_exists THEN
    RETURN FALSE;
  END IF;

  INSERT INTO subscriptions (
    user_id,
    stripe_subscription_id,
    stripe_customer_id,
    plan,
    status,
    current_period_start,
    current_period_end,
    sessions_limit,
    sessions_used,
    cancel_at_period_end
  ) VALUES (
    p_user_id,
    'free_' || p_user_id::TEXT,
    'free',
    'free',
    'active',
    now(),
    '2099-12-31T23:59:59Z'::TIMESTAMPTZ,
    1,
    0,
    FALSE
  );

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION create_free_subscription(UUID) TO service_role;

-- ============================================================
-- RPC: cancel_free_subscription
-- Called when user upgrades to a paid plan.
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_free_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'canceled',
      updated_at = now()
  WHERE user_id = p_user_id
    AND plan = 'free'
    AND status IN ('active', 'past_due', 'trialing');

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_free_subscription(UUID) TO service_role;
