begin;

-- job_descriptions: stores user-uploaded/pasted JDs for reuse.
-- Named "job_descriptions" now; can evolve into a broader "jobs" concept later
-- without breaking changes (title + company already present).
create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  company text,
  content text not null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: auto-update updated_at on row change (reuses existing function)
create trigger set_job_descriptions_updated_at
before update on public.job_descriptions
for each row execute function public.set_updated_at();

-- Indexes
create index job_descriptions_user_id_idx on public.job_descriptions (user_id);
create index job_descriptions_updated_at_idx on public.job_descriptions (updated_at desc);

-- RLS
alter table public.job_descriptions enable row level security;

create policy "Job descriptions are readable by owner"
  on public.job_descriptions for select
  using (auth.uid() = user_id);

create policy "Job descriptions are insertable by owner"
  on public.job_descriptions for insert
  with check (auth.uid() = user_id);

create policy "Job descriptions are updatable by owner"
  on public.job_descriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Job descriptions are deletable by owner"
  on public.job_descriptions for delete
  using (auth.uid() = user_id);

commit;
