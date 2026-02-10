begin;

create table public.interview_launch_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  interview_id uuid not null,
  duration_seconds int not null,
  interview_types text[] null,
  language text null,
  voice text null,
  model text null,
  dashboard_return_url text not null,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint interview_launch_codes_duration_range
    check (duration_seconds >= 300 and duration_seconds <= 7200)
);

create index interview_launch_codes_user_created_idx
  on public.interview_launch_codes (user_id, created_at desc);

create index interview_launch_codes_expires_idx
  on public.interview_launch_codes (expires_at);

create index interview_launch_codes_used_idx
  on public.interview_launch_codes (used_at);

alter table public.interview_launch_codes enable row level security;

create policy "Interview launch codes are readable by owner"
  on public.interview_launch_codes for select
  using (auth.uid() = user_id);

create policy "Interview launch codes are insertable by owner"
  on public.interview_launch_codes for insert
  with check (auth.uid() = user_id);

create policy "Interview launch codes are deletable by owner"
  on public.interview_launch_codes for delete
  using (auth.uid() = user_id);

commit;
