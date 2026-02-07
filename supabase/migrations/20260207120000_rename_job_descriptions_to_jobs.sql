begin;

-- Rename table
alter table public.job_descriptions rename to jobs;

-- Rename trigger
alter trigger set_job_descriptions_updated_at on public.jobs
  rename to set_jobs_updated_at;

-- Rename indexes
alter index job_descriptions_user_id_idx rename to jobs_user_id_idx;
alter index job_descriptions_updated_at_idx rename to jobs_updated_at_idx;
alter index job_descriptions_resume_id_idx rename to jobs_resume_id_idx;

-- Rename RLS policies
alter policy "Job descriptions are readable by owner" on public.jobs
  rename to "Jobs are readable by owner";
alter policy "Job descriptions are insertable by owner" on public.jobs
  rename to "Jobs are insertable by owner";
alter policy "Job descriptions are updatable by owner" on public.jobs
  rename to "Jobs are updatable by owner";
alter policy "Job descriptions are deletable by owner" on public.jobs
  rename to "Jobs are deletable by owner";

commit;
