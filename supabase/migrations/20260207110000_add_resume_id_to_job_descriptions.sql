begin;

-- Add nullable resume_id linking a job description to a resume.
-- ON DELETE SET NULL: deleting a resume clears the link, keeps the JD.
alter table public.job_descriptions
  add column resume_id uuid references public.resumes(id) on delete set null;

-- Index for "list JDs for a given resume" queries
create index job_descriptions_resume_id_idx
  on public.job_descriptions (resume_id)
  where resume_id is not null;

-- Tighten INSERT policy: if resume_id is provided, the resume must belong to
-- the same user. This prevents cross-user linking at the database level.
drop policy "Job descriptions are insertable by owner" on public.job_descriptions;
create policy "Job descriptions are insertable by owner"
  on public.job_descriptions for insert
  with check (
    auth.uid() = user_id
    and (
      resume_id is null
      or exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid())
    )
  );

-- Same guard on UPDATE: any new resume_id value must belong to the caller.
drop policy "Job descriptions are updatable by owner" on public.job_descriptions;
create policy "Job descriptions are updatable by owner"
  on public.job_descriptions for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      resume_id is null
      or exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid())
    )
  );

commit;
