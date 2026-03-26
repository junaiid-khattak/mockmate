begin;

alter table public.profiles
  add column if not exists country_code text null,
  add column if not exists country_name text null,
  add column if not exists city text null,
  add column if not exists region text null;

commit;
