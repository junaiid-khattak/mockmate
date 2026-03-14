-- Migration: Interview Usage Logs
-- Tracks per-session token usage and estimated cost for internal analytics.
-- Not exposed to users.

CREATE TABLE interview_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL,
  user_id UUID NOT NULL,
  job_id UUID,

  -- Agent that was used
  agent_slug TEXT,
  agent_id UUID,

  -- Realtime session usage (reported by client)
  realtime_model TEXT,
  realtime_input_tokens INTEGER DEFAULT 0,
  realtime_output_tokens INTEGER DEFAULT 0,
  realtime_audio_input_seconds NUMERIC(10,2) DEFAULT 0,
  realtime_audio_output_seconds NUMERIC(10,2) DEFAULT 0,

  -- Performance scoring usage (captured server-side)
  performance_model TEXT,
  performance_input_tokens INTEGER DEFAULT 0,
  performance_output_tokens INTEGER DEFAULT 0,

  -- Duration
  session_duration_seconds INTEGER,

  -- Estimated costs in USD (calculated at write time)
  realtime_cost_usd NUMERIC(10,6) DEFAULT 0,
  performance_cost_usd NUMERIC(10,6) DEFAULT 0,
  total_cost_usd NUMERIC(10,6) DEFAULT 0,

  -- Subscription context
  credit_source TEXT,
  subscription_plan TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_logs_interview ON interview_usage_logs(interview_id);
CREATE INDEX idx_usage_logs_user ON interview_usage_logs(user_id);
CREATE INDEX idx_usage_logs_created ON interview_usage_logs(created_at);

-- RLS: service_role only (internal analytics)
ALTER TABLE interview_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on interview_usage_logs"
  ON interview_usage_logs FOR ALL
  USING (auth.role() = 'service_role');
