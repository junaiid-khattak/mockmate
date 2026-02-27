-- Add sharing columns to interview_sessions
ALTER TABLE interview_sessions
  ADD COLUMN share_token text UNIQUE,
  ADD COLUMN is_shared   boolean NOT NULL DEFAULT false;

-- Fast lookup by token
CREATE INDEX idx_interview_sessions_share_token
  ON interview_sessions (share_token)
  WHERE share_token IS NOT NULL;

-- Allow anonymous users to read interviews that have been shared
CREATE POLICY "Public can view shared interviews"
  ON interview_sessions
  FOR SELECT
  TO anon
  USING (is_shared = true AND share_token IS NOT NULL);
