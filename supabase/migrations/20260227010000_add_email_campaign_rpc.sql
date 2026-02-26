-- get_nudge_targets() RPC function
-- Returns one row per eligible user: their highest-scoring job with a ready fit
-- analysis that has never had a mock interview session started.
-- Used by email-marketing/send_campaign.py as an optional faster alternative
-- to the Python-side three-query join in fetch_targets().

CREATE OR REPLACE FUNCTION get_nudge_targets()
RETURNS TABLE (
    user_id              uuid,
    email                text,
    first_name           text,
    job_title            text,
    company              text,
    fit_score            integer,
    fit_strong_alignment jsonb,
    fit_weak_spots       jsonb,
    fit_areas_to_probe   jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT ON (p.id)
        p.id                        AS user_id,
        au.email,
        p.first_name,
        j.title                     AS job_title,
        j.company,
        j.fit_score,
        j.fit_strong_alignment,
        j.fit_weak_spots,
        j.fit_areas_to_probe
    FROM profiles p
    JOIN auth.users au               ON au.id     = p.id
    JOIN jobs j                      ON j.user_id = p.id
                                    AND j.fit_score_status = 'ready'
                                    AND j.fit_score IS NOT NULL
    LEFT JOIN interview_sessions iss ON iss.user_id = p.id
    WHERE iss.id IS NULL
      AND au.email IS NOT NULL
    ORDER BY
        p.id,
        j.fit_score DESC;
$$;

-- Revoke public access; only the service role (via SECURITY DEFINER) can call this
REVOKE ALL ON FUNCTION get_nudge_targets() FROM PUBLIC;
