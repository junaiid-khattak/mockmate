begin;

-- Add columns for multi-attempt interview tracking
alter table public.interview_sessions
  add column job_id uuid references public.jobs(id) on delete cascade,
  add column attempt_number integer not null default 1,
  add column transcript jsonb,
  add column recommendations jsonb;

-- Add index for fast lookup: all interviews for a job by a user, ordered by attempt
create index idx_interviews_job_user_attempt
  on public.interview_sessions(job_id, user_id, attempt_number desc);

-- Add unique constraint: one interview per (job, user, attempt_number)
alter table public.interview_sessions
  add constraint interview_sessions_job_user_attempt_unique
  unique (job_id, user_id, attempt_number);

-- Add check constraint: attempt_number must be positive
alter table public.interview_sessions
  add constraint interview_sessions_attempt_number_positive
  check (attempt_number > 0);

-- Add check constraint: transcript must be an array when not null
alter table public.interview_sessions
  add constraint interview_sessions_transcript_is_array
  check (
    transcript is null or
    jsonb_typeof(transcript) = 'array'
  );

-- Add check constraint: recommendations must be an array when not null
alter table public.interview_sessions
  add constraint interview_sessions_recommendations_is_array
  check (
    recommendations is null or
    jsonb_typeof(recommendations) = 'array'
  );

-- Backfill attempt_number for existing interviews
-- All existing interviews will be marked as attempt 1
update public.interview_sessions
set attempt_number = 1
where attempt_number is null;

commit;
