-- Migration: Interview Agent Configuration
-- Moves agent config from env vars to database with plan-based assignment.

-- ============================================================
-- Table: interview_agents
-- ============================================================
CREATE TABLE interview_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- OpenAI Realtime config
  realtime_model TEXT NOT NULL DEFAULT 'gpt-realtime',
  voice TEXT NOT NULL DEFAULT 'alloy',
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.70,
  max_response_tokens TEXT NOT NULL DEFAULT '4096',
  speech_speed NUMERIC(3,2) NOT NULL DEFAULT 1.00,

  -- VAD (Voice Activity Detection) config
  vad_threshold NUMERIC(4,3) NOT NULL DEFAULT 0.620,
  vad_prefix_ms INTEGER NOT NULL DEFAULT 450,
  vad_silence_ms INTEGER NOT NULL DEFAULT 900,
  vad_create_response BOOLEAN NOT NULL DEFAULT TRUE,
  vad_interrupt_response BOOLEAN NOT NULL DEFAULT FALSE,

  -- Noise reduction
  noise_reduction_type TEXT DEFAULT 'far_field',

  -- Performance evaluation
  performance_model TEXT NOT NULL DEFAULT 'gpt-4.1-mini',
  transcription_model TEXT NOT NULL DEFAULT 'gpt-4o-transcribe',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: subscription_plan_agents
-- Every subscription plan MUST have a mapping.
-- ============================================================
CREATE TABLE subscription_plan_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL UNIQUE,
  agent_id UUID NOT NULL REFERENCES interview_agents(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_agents_agent ON subscription_plan_agents(agent_id);

-- ============================================================
-- Alter: interview_launch_codes — add agent_config snapshot
-- ============================================================
ALTER TABLE interview_launch_codes
  ADD COLUMN agent_config JSONB NULL;

-- ============================================================
-- RPC: get_interview_agent_for_user
-- Returns the agent config for a user based on their active
-- subscription plan. Returns NULL (empty set) if no mapping.
-- ============================================================
CREATE OR REPLACE FUNCTION get_interview_agent_for_user(p_user_id UUID)
RETURNS TABLE (
  agent_id UUID,
  agent_slug TEXT,
  display_name TEXT,
  realtime_model TEXT,
  voice TEXT,
  temperature NUMERIC,
  max_response_tokens TEXT,
  speech_speed NUMERIC,
  vad_threshold NUMERIC,
  vad_prefix_ms INTEGER,
  vad_silence_ms INTEGER,
  vad_create_response BOOLEAN,
  vad_interrupt_response BOOLEAN,
  noise_reduction_type TEXT,
  performance_model TEXT,
  transcription_model TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id AS agent_id,
    a.slug AS agent_slug,
    a.display_name,
    a.realtime_model,
    a.voice,
    a.temperature,
    a.max_response_tokens,
    a.speech_speed,
    a.vad_threshold,
    a.vad_prefix_ms,
    a.vad_silence_ms,
    a.vad_create_response,
    a.vad_interrupt_response,
    a.noise_reduction_type,
    a.performance_model,
    a.transcription_model
  FROM subscriptions s
  INNER JOIN subscription_plan_agents spa ON spa.plan = s.plan
  INNER JOIN interview_agents a ON a.id = spa.agent_id
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'past_due')
    AND s.current_period_end > now()
    AND a.active = TRUE
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_interview_agent_for_user(UUID) TO service_role;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE interview_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on interview_agents"
  ON interview_agents FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE subscription_plan_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscription_plan_agents"
  ON subscription_plan_agents FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Seed: agents
-- ============================================================
INSERT INTO interview_agents (slug, display_name, realtime_model, voice, temperature, performance_model)
VALUES
  ('basic',    'Basic Agent',    'gpt-realtime', 'alloy', 0.70, 'gpt-4.1-mini'),
  ('standard', 'Standard Agent', 'gpt-realtime', 'alloy', 0.70, 'gpt-4.1-mini'),
  ('premium',  'Premium Agent',  'gpt-realtime', 'alloy', 0.65, 'gpt-4.1-mini');

-- ============================================================
-- Seed: plan → agent mappings (every plan needs one)
-- ============================================================
INSERT INTO subscription_plan_agents (plan, agent_id)
  SELECT 'free', id FROM interview_agents WHERE slug = 'basic';
INSERT INTO subscription_plan_agents (plan, agent_id)
  SELECT 'starter_monthly', id FROM interview_agents WHERE slug = 'standard';
INSERT INTO subscription_plan_agents (plan, agent_id)
  SELECT 'pro_monthly', id FROM interview_agents WHERE slug = 'standard';
INSERT INTO subscription_plan_agents (plan, agent_id)
  SELECT 'power_monthly', id FROM interview_agents WHERE slug = 'premium';
