begin;

-- Run tracking
alter table public.jobs
  add column analysis_run_id      uuid,
  add column analysis_requested_at timestamptz;

-- Questions fields
alter table public.jobs
  add column questions           jsonb,
  add column questions_status    text,
  add column questions_version   text,
  add column questions_error     text,
  add column questions_updated_at timestamptz;

-- questions_status allowed values
alter table public.jobs
  add constraint jobs_questions_status_values
  check (questions_status is null or questions_status in ('pending', 'ready', 'failed'));

-- questions must be a JSON array when not null
alter table public.jobs
  add constraint jobs_questions_is_array
  check (questions is null or jsonb_typeof(questions) = 'array');

commit;
