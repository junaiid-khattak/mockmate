begin;

-- 1. Remove FK and column: interview_sessions.entitlement_id → entitlements
alter table public.interview_sessions
  drop constraint if exists interview_sessions_entitlement_id_fkey;
alter table public.interview_sessions
  drop column if exists entitlement_id;

-- 2. Remove FK and column: interview_credit_grants.order_id → orders
alter table public.interview_credit_grants
  drop constraint if exists interview_credit_grants_order_id_fkey;
drop index if exists interview_credit_grants_order_id_idx;
alter table public.interview_credit_grants
  drop column if exists order_id;

-- 3. Remove FK and column: interview_credit_grants.plan_id → plans
alter table public.interview_credit_grants
  drop constraint if exists interview_credit_grants_plan_id_fkey;
alter table public.interview_credit_grants
  drop column if exists plan_id;

-- 4. Drop legacy tables (order matters due to FK dependencies)
drop table if exists public.entitlement_usage;
drop table if exists public.entitlements;
drop table if exists public.orders;
drop table if exists public.plans;
drop table if exists public.payment_events;

commit;
