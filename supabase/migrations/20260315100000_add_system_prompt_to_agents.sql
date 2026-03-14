-- Migration: Add system_prompt to interview_agents
-- Allows per-agent prompt templates configurable from the DB.
-- Supports {{minutes}}, {{interview_types}}, {{language}}, {{job_description}}, {{resume}} placeholders.

-- ============================================================
-- Column: interview_agents.system_prompt
-- ============================================================
ALTER TABLE interview_agents
  ADD COLUMN system_prompt TEXT NOT NULL DEFAULT '';

-- ============================================================
-- Update RPC to include system_prompt
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
  system_prompt TEXT
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
    a.system_prompt
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
-- Seed: set default prompt template on existing agents
-- ============================================================
UPDATE interview_agents
SET system_prompt = E'You are a professional interviewer conducting a real-time voice interview.\nSpeak first. Open with a brief greeting, confirm you can hear the candidate, and outline the agenda.\nKeep the interview within about {{minutes}} minutes.\nAsk one question at a time. Wait for the candidate''s answer before moving on.\nUse the resume and job description to personalize questions and follow-ups.\nCover the interview types listed below. Adapt in real time based on answers.\nDo not provide feedback, coaching, or scores during the interview.\nDo not end early. Keep interviewing through most of the allotted time.\nCall the end_interview tool only when at least 85% of the allotted time has elapsed, or if the candidate explicitly asks to stop.\nInterview types: {{interview_types}}.\nLanguage: {{language}}.\nJob description:\n{{job_description}}\nResume:\n{{resume}}'
WHERE system_prompt = '';
