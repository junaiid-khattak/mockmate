-- ============================================================
-- Affiliate System Migration
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add role column to profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- ------------------------------------------------------------
-- 2. Admin helper function
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ------------------------------------------------------------
-- 3. Referral code generator
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base    TEXT;
  v_code    TEXT;
  v_suffix  TEXT;
  v_chars   TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_len     INT;
  i         INT;
BEGIN
  -- Extract alphanumeric prefix from name (up to 5 chars, uppercased)
  v_base := UPPER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '', 'g'));
  v_base := SUBSTRING(v_base FROM 1 FOR 5);
  IF LENGTH(v_base) < 2 THEN v_base := 'AFF'; END IF;

  -- Try up to 10 times to find a unique code
  FOR attempt IN 1..10 LOOP
    v_suffix := '';
    FOR i IN 1..3 LOOP
      v_suffix := v_suffix || SUBSTRING(v_chars FROM (FLOOR(RANDOM() * LENGTH(v_chars))::INT + 1) FOR 1);
    END LOOP;
    v_code := v_base || v_suffix;

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM public.affiliates WHERE referral_code = v_code) THEN
      RETURN v_code;
    END IF;
  END LOOP;

  -- Fallback: use timestamp suffix
  RETURN v_base || TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT % 100000, 'FM00000');
END;
$$;

-- ------------------------------------------------------------
-- 4. Main affiliate tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.affiliates (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  email                    TEXT NOT NULL,
  referral_code            TEXT NOT NULL UNIQUE,
  commission_rate          DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  status                   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'active', 'paused', 'rejected')),
  payout_method            TEXT CHECK (payout_method IN ('paypal', 'bank_transfer', 'wise')),
  payout_details           JSONB NOT NULL DEFAULT '{}',
  -- Denormalized stats (updated by functions/triggers)
  total_clicks             INTEGER NOT NULL DEFAULT 0,
  total_signups            INTEGER NOT NULL DEFAULT 0,
  total_conversions        INTEGER NOT NULL DEFAULT 0,
  total_revenue            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_commission_earned  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_commission_paid    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_affiliate UNIQUE (user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON public.affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);

-- ----

CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_address    INET,
  user_agent    TEXT,
  referrer_url  TEXT,
  landing_page  TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_affiliate_id ON public.referral_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_created_at ON public.referral_clicks(created_at);

-- ----

CREATE TABLE IF NOT EXISTS public.referral_signups (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id        UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_used  TEXT NOT NULL,
  landing_page        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_signups_affiliate_id ON public.referral_signups(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referred_user_id ON public.referral_signups(referred_user_id);

-- ----

CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id        UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_signup_id  UUID REFERENCES public.referral_signups(id),
  credit_pack         TEXT NOT NULL,
  purchase_amount     DECIMAL(10,2) NOT NULL,
  stripe_payment_id   TEXT,
  commission_rate     DECIMAL(5,2) NOT NULL,
  commission_amount   DECIMAL(10,2) NOT NULL,
  commission_status   TEXT NOT NULL DEFAULT 'pending'
                        CHECK (commission_status IN ('pending', 'approved', 'paid', 'refunded')),
  paid_at             TIMESTAMPTZ,
  payout_reference    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_conversions_affiliate_id ON public.referral_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_commission_status ON public.referral_conversions(commission_status);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_created_at ON public.referral_conversions(created_at);

-- ----

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id     UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount           DECIMAL(10,2) NOT NULL,
  payout_method    TEXT NOT NULL,
  payout_reference TEXT,
  notes            TEXT,
  conversion_ids   UUID[] NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'completed'
                     CHECK (status IN ('completed', 'failed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);

-- ------------------------------------------------------------
-- 5. Updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_affiliates_updated_at') THEN
    CREATE TRIGGER trg_affiliates_updated_at
      BEFORE UPDATE ON public.affiliates
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_referral_conversions_updated_at') THEN
    CREATE TRIGGER trg_referral_conversions_updated_at
      BEFORE UPDATE ON public.referral_conversions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ------------------------------------------------------------
-- 6. Affiliate stats RPC functions
-- ------------------------------------------------------------

-- Increment click count atomically
CREATE OR REPLACE FUNCTION public.increment_affiliate_clicks(p_affiliate_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.affiliates
  SET total_clicks = total_clicks + 1, updated_at = now()
  WHERE id = p_affiliate_id;
END;
$$;

-- Increment signup count atomically
CREATE OR REPLACE FUNCTION public.increment_affiliate_signups(p_affiliate_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.affiliates
  SET total_signups = total_signups + 1, updated_at = now()
  WHERE id = p_affiliate_id;
END;
$$;

-- Increment paid commission atomically
CREATE OR REPLACE FUNCTION public.increment_affiliate_commission_paid(
  p_affiliate_id UUID,
  p_amount       DECIMAL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.affiliates
  SET
    total_commission_paid = total_commission_paid + p_amount,
    updated_at            = now()
  WHERE id = p_affiliate_id;
END;
$$;

-- Update conversion stats atomically
CREATE OR REPLACE FUNCTION public.increment_affiliate_conversion_stats(
  p_affiliate_id       UUID,
  p_purchase_amount    DECIMAL,
  p_commission_amount  DECIMAL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.affiliates
  SET
    total_conversions       = total_conversions + 1,
    total_revenue           = total_revenue + p_purchase_amount,
    total_commission_earned = total_commission_earned + p_commission_amount,
    updated_at              = now()
  WHERE id = p_affiliate_id;
END;
$$;

-- ------------------------------------------------------------
-- 7. RLS Policies
-- ------------------------------------------------------------
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- affiliates: own row
DROP POLICY IF EXISTS "Affiliates can view own record" ON public.affiliates;
CREATE POLICY "Affiliates can view own record" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Affiliates can update own payout details" ON public.affiliates;
CREATE POLICY "Affiliates can update own payout details" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- affiliates: admin
DROP POLICY IF EXISTS "Admins have full access to affiliates" ON public.affiliates;
CREATE POLICY "Admins have full access to affiliates" ON public.affiliates
  FOR ALL USING (public.is_admin());

-- referral_clicks: own + admin + service-role INSERT (anon for track-click endpoint)
DROP POLICY IF EXISTS "Affiliates can view own clicks" ON public.referral_clicks;
CREATE POLICY "Affiliates can view own clicks" ON public.referral_clicks
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role can insert clicks" ON public.referral_clicks;
CREATE POLICY "Service role can insert clicks" ON public.referral_clicks
  FOR INSERT WITH CHECK (true); -- service role bypasses RLS; this allows anon inserts from API

DROP POLICY IF EXISTS "Admins have full access to clicks" ON public.referral_clicks;
CREATE POLICY "Admins have full access to clicks" ON public.referral_clicks
  FOR ALL USING (public.is_admin());

-- referral_signups
DROP POLICY IF EXISTS "Affiliates can view own signups" ON public.referral_signups;
CREATE POLICY "Affiliates can view own signups" ON public.referral_signups
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins have full access to signups" ON public.referral_signups;
CREATE POLICY "Admins have full access to signups" ON public.referral_signups
  FOR ALL USING (public.is_admin());

-- referral_conversions
DROP POLICY IF EXISTS "Affiliates can view own conversions" ON public.referral_conversions;
CREATE POLICY "Affiliates can view own conversions" ON public.referral_conversions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins have full access to conversions" ON public.referral_conversions;
CREATE POLICY "Admins have full access to conversions" ON public.referral_conversions
  FOR ALL USING (public.is_admin());

-- affiliate_payouts
DROP POLICY IF EXISTS "Affiliates can view own payouts" ON public.affiliate_payouts;
CREATE POLICY "Affiliates can view own payouts" ON public.affiliate_payouts
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins have full access to payouts" ON public.affiliate_payouts;
CREATE POLICY "Admins have full access to payouts" ON public.affiliate_payouts
  FOR ALL USING (public.is_admin());
