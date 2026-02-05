begin;

create extension if not exists "pgcrypto";

-- 1) profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  avatar_url text null,
  target_roles text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 2) plans
create table public.plans (
  id text primary key,
  name text not null,
  billing_type text not null,
  interval text null,
  minutes_included int not null,
  validity_days int null,
  price_cents int null,
  currency text not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.plans (id, name, billing_type, interval, minutes_included, validity_days, price_cents)
values
  ('free', 'Free', 'free', null, 5, null, null),
  ('monthly', 'Monthly', 'recurring', 'month', 120, null, 1000),
  ('week_pass', 'Week Pass', 'one_time', null, 90, 7, 1900),
  ('one_off', 'One Off', 'one_time', null, 60, 7, 1200)
on conflict (id) do nothing;

-- 3) orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status text not null,
  provider text not null default '2checkout',
  provider_order_id text null,
  provider_invoice_id text null,
  amount_cents int not null,
  currency text not null default 'USD',
  paid_at timestamptz null,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create unique index orders_provider_order_id_unique
  on public.orders (provider, provider_order_id)
  where provider_order_id is not null;

-- 4) entitlements
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  plan_id text null references public.plans(id),
  order_id uuid null references public.orders(id) on delete set null,
  status text not null default 'active',
  minutes_total int not null,
  minutes_used int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz null,
  provider text not null default '2checkout',
  created_at timestamptz not null default now()
);

create index entitlements_user_id_idx on public.entitlements (user_id);

-- 5) entitlement_usage
create table public.entitlement_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entitlement_id uuid not null references public.entitlements(id) on delete cascade,
  session_id uuid null,
  minutes int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 6) payment_events
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default '2checkout',
  event_type text not null,
  provider_event_id text null,
  provider_order_id text null,
  user_id uuid null references public.profiles(id) on delete set null,
  payload jsonb not null,
  processed boolean not null default false,
  processed_at timestamptz null,
  error text null,
  created_at timestamptz not null default now()
);

create index payment_events_user_id_idx on public.payment_events (user_id);
create index payment_events_provider_order_id_idx on public.payment_events (provider_order_id);

-- 7) files
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  storage_provider text not null default 'r2',
  bucket text null,
  storage_key text not null,
  mime_type text null,
  size_bytes bigint null,
  sha256 text null,
  original_filename text null,
  created_at timestamptz not null default now()
);

-- 8) agent_personas
create table public.agent_personas (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text null,
  is_public boolean not null default true,
  is_default boolean not null default false,
  config jsonb not null,
  created_at timestamptz not null default now()
);

insert into public.agent_personas (key, name, description, is_public, is_default, config)
values (
  'professional_evaluator',
  'Professional Evaluator',
  'Structured, calibrated interviewer with rubric-based scoring.',
  true,
  true,
  '{
    "strictness": 4,
    "interruptions": "low",
    "rubric_weights": {
      "communication": 0.3,
      "structure": 0.3,
      "technical": 0.4
    }
  }'::jsonb
)
on conflict (key) do nothing;

-- 9) interview_sessions
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entitlement_id uuid null references public.entitlements(id),
  mode text not null default 'general',
  status text not null default 'created',
  started_at timestamptz null,
  ended_at timestamptz null,
  duration_seconds int null,
  overall_score numeric(4,2) null,
  summary text null,
  created_at timestamptz not null default now()
);

-- Trigger: create profile + free entitlement on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.entitlements (user_id, source, plan_id, minutes_total, valid_until)
  values (new.id, 'free', 'free', 5, null);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

alter table public.orders enable row level security;
create policy "Orders are readable by owner"
  on public.orders for select
  using (auth.uid() = user_id);
create policy "Orders are insertable by owner"
  on public.orders for insert
  with check (auth.uid() = user_id);
create policy "Orders are updatable by owner"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.entitlements enable row level security;
create policy "Entitlements are readable by owner"
  on public.entitlements for select
  using (auth.uid() = user_id);
create policy "Entitlements are insertable by owner"
  on public.entitlements for insert
  with check (auth.uid() = user_id);
create policy "Entitlements are updatable by owner"
  on public.entitlements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.entitlement_usage enable row level security;
create policy "Entitlement usage is readable by owner"
  on public.entitlement_usage for select
  using (auth.uid() = user_id);
create policy "Entitlement usage is insertable by owner"
  on public.entitlement_usage for insert
  with check (auth.uid() = user_id);
create policy "Entitlement usage is updatable by owner"
  on public.entitlement_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.files enable row level security;
create policy "Files are readable by owner"
  on public.files for select
  using (auth.uid() = user_id);
create policy "Files are insertable by owner"
  on public.files for insert
  with check (auth.uid() = user_id);
create policy "Files are updatable by owner"
  on public.files for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.interview_sessions enable row level security;
create policy "Interview sessions are readable by owner"
  on public.interview_sessions for select
  using (auth.uid() = user_id);
create policy "Interview sessions are insertable by owner"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);
create policy "Interview sessions are updatable by owner"
  on public.interview_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.payment_events enable row level security;

commit;
