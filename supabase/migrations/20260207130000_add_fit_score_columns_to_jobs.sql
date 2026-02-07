begin;

-- Fit scoring columns
alter table public.jobs
  add column fit_score          integer,
  add column fit_score_status   text,
  add column fit_score_version  text,
  add column fit_score_error    text,
  add column fit_score_updated_at timestamptz;

-- fit_score must be 1–10 when not null
alter table public.jobs
  add constraint jobs_fit_score_range
  check (fit_score is null or (fit_score >= 1 and fit_score <= 10));

-- fit_score_status must be one of the allowed values when not null
alter table public.jobs
  add constraint jobs_fit_score_status_values
  check (fit_score_status is null or fit_score_status in ('pending', 'ready', 'failed'));

commit;
