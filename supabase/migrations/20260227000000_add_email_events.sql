-- email_events table + opened_but_no_interview view
-- Used by the email-marketing campaign to log tracking pixel fires (opens)
-- and provide a retargeting list of users who opened but haven't interviewed.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_events (
    id          bigserial    PRIMARY KEY,
    user_id     uuid         REFERENCES auth.users (id) ON DELETE SET NULL,
    campaign    text         NOT NULL,
    event_type  text         NOT NULL DEFAULT 'open',  -- 'open' | 'click' | ...
    ip          text,
    user_agent  text,
    created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_events_user_id_idx    ON email_events (user_id);
CREATE INDEX IF NOT EXISTS email_events_campaign_idx   ON email_events (campaign);
CREATE INDEX IF NOT EXISTS email_events_created_at_idx ON email_events (created_at DESC);

-- Row-Level Security — no user should ever read/write this table directly;
-- only the service role (SECURITY DEFINER functions / Edge Functions) can insert.
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Deny everything for authenticated and anon roles (service role bypasses RLS)
CREATE POLICY "deny_all" ON email_events
    AS RESTRICTIVE
    FOR ALL
    TO authenticated, anon
    USING (false);


-- ── View: opened_but_no_interview ─────────────────────────────────────────────
-- Returns one row per user who:
--   • fired the tracking pixel (email opened)
--   • has a ready fit score on at least one job
--   • has still never started a mock interview

CREATE OR REPLACE VIEW opened_but_no_interview AS
SELECT
    ee.user_id,
    au.email,
    p.first_name,
    MIN(ee.created_at)   AS first_open_at,
    MAX(ee.created_at)   AS last_open_at,
    COUNT(*)             AS open_count,
    MAX(j.fit_score)     AS best_fit_score,
    (
        SELECT j2.title
        FROM   jobs j2
        WHERE  j2.user_id = ee.user_id
          AND  j2.fit_score_status = 'ready'
        ORDER  BY j2.fit_score DESC
        LIMIT  1
    )                    AS top_job_title,
    (
        SELECT j2.company
        FROM   jobs j2
        WHERE  j2.user_id = ee.user_id
          AND  j2.fit_score_status = 'ready'
        ORDER  BY j2.fit_score DESC
        LIMIT  1
    )                    AS top_job_company
FROM  email_events ee
JOIN  auth.users   au  ON au.id     = ee.user_id
JOIN  profiles     p   ON p.id      = ee.user_id
JOIN  jobs         j   ON j.user_id = ee.user_id
                      AND j.fit_score_status = 'ready'
WHERE NOT EXISTS (
    SELECT 1
    FROM   interview_sessions iss
    WHERE  iss.user_id = ee.user_id
)
GROUP BY ee.user_id, au.email, p.first_name;

COMMENT ON VIEW opened_but_no_interview IS
    'Users who opened the nudge email (tracking pixel fired) but have not yet '
    'started any mock interview — good candidates for a follow-up campaign.';
