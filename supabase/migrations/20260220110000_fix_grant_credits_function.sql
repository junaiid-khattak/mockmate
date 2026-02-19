begin;

-- Drop the old function signature (includes plan_id/order_id params that
-- reference columns removed in 20260220100000_drop_legacy_billing_tables).
drop function if exists public.grant_interview_credits(
  uuid, text, text, integer, text, uuid, text, jsonb, timestamptz
);

-- Recreate without plan_id / order_id parameters or INSERT columns.
create or replace function public.grant_interview_credits(
  p_user_id uuid,
  p_grant_key text,
  p_source text,
  p_credits integer,
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

  if p_credits is null or p_credits = 0 then
    raise exception 'p_credits must be non-zero';
  end if;

  -- Only allow negative credits for refund source
  if p_credits < 0 and p_source <> 'stripe_refund' then
    raise exception 'negative credits only allowed for stripe_refund source';
  end if;

  if p_source not in (
    'subscription_cycle',
    'one_off_purchase',
    'manual_adjustment',
    'stripe_refund'
  ) then
    raise exception 'p_source must be one of subscription_cycle, one_off_purchase, manual_adjustment, stripe_refund';
  end if;

  perform 1
  from public.profiles
  where id = p_user_id
  for update;

  insert into public.interview_credit_grants (
    user_id,
    grant_key,
    source,
    provider,
    credits,
    metadata,
    expires_at
  )
  values (
    p_user_id,
    p_grant_key,
    p_source,
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

grant execute on function public.grant_interview_credits(
  uuid, text, text, integer, text, jsonb, timestamptz
) to service_role;

commit;
