begin;

alter table public.plans
  add column if not exists interview_credits_included int not null default 0;

insert into public.plans (
  id,
  name,
  billing_type,
  interval,
  minutes_included,
  interview_credits_included,
  validity_days,
  price_cents,
  currency,
  active
)
values
  ('free', 'Free', 'free', 'month', 0, 0, null, 0, 'USD', true),
  ('standard', 'Standard', 'recurring', 'month', 0, 2, null, 1500, 'USD', true),
  ('pro', 'Pro', 'recurring', 'month', 0, 5, null, 2900, 'USD', true)
on conflict (id) do update set
  name = excluded.name,
  billing_type = excluded.billing_type,
  interval = excluded.interval,
  interview_credits_included = excluded.interview_credits_included,
  minutes_included = excluded.minutes_included,
  validity_days = excluded.validity_days,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  active = excluded.active;

update public.plans
set active = false
where id in ('monthly', 'week_pass', 'one_off');

create table if not exists public.interview_credit_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  grant_key text not null unique,
  source text not null,
  plan_id text null references public.plans(id),
  order_id uuid null references public.orders(id) on delete set null,
  provider text null,
  credits int not null check (credits > 0),
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists interview_credit_grants_user_id_idx
  on public.interview_credit_grants (user_id);
create index if not exists interview_credit_grants_granted_at_idx
  on public.interview_credit_grants (granted_at desc);
create index if not exists interview_credit_grants_order_id_idx
  on public.interview_credit_grants (order_id)
  where order_id is not null;

create table if not exists public.interview_credit_consumptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interview_id uuid not null,
  credits int not null default 1 check (credits > 0),
  reason text not null default 'interview_start',
  consumed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (interview_id)
);

create index if not exists interview_credit_consumptions_user_id_idx
  on public.interview_credit_consumptions (user_id);
create index if not exists interview_credit_consumptions_consumed_at_idx
  on public.interview_credit_consumptions (consumed_at desc);

alter table public.interview_credit_grants enable row level security;
alter table public.interview_credit_consumptions enable row level security;

create policy "Interview credit grants are readable by owner"
  on public.interview_credit_grants
  for select
  using (auth.uid() = user_id);

create policy "Interview credit consumptions are readable by owner"
  on public.interview_credit_consumptions
  for select
  using (auth.uid() = user_id);

create or replace function public.get_interview_credit_balance(
  p_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_granted integer := 0;
  v_consumed integer := 0;
begin
  select coalesce(sum(g.credits), 0)
    into v_granted
  from public.interview_credit_grants g
  where g.user_id = p_user_id
    and (g.expires_at is null or g.expires_at > now());

  select coalesce(sum(c.credits), 0)
    into v_consumed
  from public.interview_credit_consumptions c
  where c.user_id = p_user_id;

  return greatest(v_granted - v_consumed, 0);
end;
$$;

create or replace function public.consume_interview_credit(
  p_user_id uuid,
  p_interview_id uuid,
  p_reason text default 'interview_start'
)
returns table (
  ok boolean,
  error_code text,
  balance_after integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_user uuid;
  v_balance integer;
begin
  if p_user_id is null or p_interview_id is null then
    return query select false, 'invalid_input'::text, null::integer;
    return;
  end if;

  perform 1
  from public.profiles
  where id = p_user_id
  for update;

  select c.user_id
    into v_existing_user
  from public.interview_credit_consumptions c
  where c.interview_id = p_interview_id
  limit 1;

  if v_existing_user is not null then
    if v_existing_user = p_user_id then
      v_balance := public.get_interview_credit_balance(p_user_id);
      return query select true, null::text, v_balance;
      return;
    end if;

    return query select false, 'interview_already_consumed'::text, null::integer;
    return;
  end if;

  v_balance := public.get_interview_credit_balance(p_user_id);
  if v_balance < 1 then
    return query select false, 'insufficient_credits'::text, v_balance;
    return;
  end if;

  insert into public.interview_credit_consumptions (
    user_id,
    interview_id,
    credits,
    reason
  )
  values (
    p_user_id,
    p_interview_id,
    1,
    coalesce(nullif(btrim(p_reason), ''), 'interview_start')
  );

  v_balance := public.get_interview_credit_balance(p_user_id);
  return query select true, null::text, v_balance;
exception
  when unique_violation then
    select c.user_id
      into v_existing_user
    from public.interview_credit_consumptions c
    where c.interview_id = p_interview_id
    limit 1;

    if v_existing_user = p_user_id then
      v_balance := public.get_interview_credit_balance(p_user_id);
      return query select true, null::text, v_balance;
      return;
    end if;

    return query select false, 'interview_already_consumed'::text, null::integer;
end;
$$;

create or replace function public.grant_interview_credits(
  p_user_id uuid,
  p_grant_key text,
  p_source text,
  p_credits integer,
  p_plan_id text default null,
  p_order_id uuid default null,
  p_provider text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_expires_at timestamptz default null
)
returns table (
  ok boolean,
  grant_id uuid,
  created boolean,
  balance_after integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant_id uuid;
  v_created boolean := false;
  v_balance integer;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  if p_grant_key is null or btrim(p_grant_key) = '' then
    raise exception 'p_grant_key is required';
  end if;

  if p_credits is null or p_credits <= 0 then
    raise exception 'p_credits must be greater than zero';
  end if;

  if p_source not in ('subscription_cycle', 'one_off_purchase', 'manual_adjustment') then
    raise exception 'p_source must be one of subscription_cycle, one_off_purchase, manual_adjustment';
  end if;

  perform 1
  from public.profiles
  where id = p_user_id
  for update;

  insert into public.interview_credit_grants (
    user_id,
    grant_key,
    source,
    plan_id,
    order_id,
    provider,
    credits,
    metadata,
    expires_at
  )
  values (
    p_user_id,
    p_grant_key,
    p_source,
    p_plan_id,
    p_order_id,
    p_provider,
    p_credits,
    coalesce(p_metadata, '{}'::jsonb),
    p_expires_at
  )
  on conflict (grant_key) do nothing
  returning id into v_grant_id;

  if v_grant_id is null then
    select g.id
      into v_grant_id
    from public.interview_credit_grants g
    where g.grant_key = p_grant_key
    limit 1;
  else
    v_created := true;
  end if;

  v_balance := public.get_interview_credit_balance(p_user_id);
  return query select true, v_grant_id, v_created, v_balance;
end;
$$;

grant execute on function public.get_interview_credit_balance(uuid)
  to authenticated, service_role;
grant execute on function public.consume_interview_credit(uuid, uuid, text)
  to authenticated, service_role;
grant execute on function public.grant_interview_credits(
  uuid,
  text,
  text,
  integer,
  text,
  uuid,
  text,
  jsonb,
  timestamptz
) to service_role;

commit;
