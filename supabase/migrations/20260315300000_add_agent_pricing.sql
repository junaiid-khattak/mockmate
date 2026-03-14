-- Migration: Add model pricing to interview_agents
-- Stores per-model cost rates so pricing is configurable from DB.
-- Rates are in USD.

-- ============================================================
-- Pricing columns on interview_agents
-- ============================================================
ALTER TABLE interview_agents
  ADD COLUMN realtime_audio_input_cost_per_min NUMERIC(10,6) NOT NULL DEFAULT 0.060000,
  ADD COLUMN realtime_audio_output_cost_per_min NUMERIC(10,6) NOT NULL DEFAULT 0.240000,
  ADD COLUMN realtime_text_input_cost_per_mtok NUMERIC(10,6) NOT NULL DEFAULT 5.000000,
  ADD COLUMN realtime_text_output_cost_per_mtok NUMERIC(10,6) NOT NULL DEFAULT 20.000000,
  ADD COLUMN performance_input_cost_per_mtok NUMERIC(10,6) NOT NULL DEFAULT 0.400000,
  ADD COLUMN performance_output_cost_per_mtok NUMERIC(10,6) NOT NULL DEFAULT 1.600000;

-- ============================================================
-- Update RPC to include pricing columns
-- Must DROP first because return type is changing
-- ============================================================
DROP FUNCTION IF EXISTS get_interview_agent_for_user(UUID);
CREATE FUNCTION get_interview_agent_for_user(p_user_id UUID)
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
  transcription_model TEXT,
  system_prompt TEXT,
  realtime_audio_input_cost_per_min NUMERIC,
  realtime_audio_output_cost_per_min NUMERIC,
  realtime_text_input_cost_per_mtok NUMERIC,
  realtime_text_output_cost_per_mtok NUMERIC,
  performance_input_cost_per_mtok NUMERIC,
  performance_output_cost_per_mtok NUMERIC
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
    a.transcription_model,
    a.system_prompt,
    a.realtime_audio_input_cost_per_min,
    a.realtime_audio_output_cost_per_min,
    a.realtime_text_input_cost_per_mtok,
    a.realtime_text_output_cost_per_mtok,
    a.performance_input_cost_per_mtok,
    a.performance_output_cost_per_mtok
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
