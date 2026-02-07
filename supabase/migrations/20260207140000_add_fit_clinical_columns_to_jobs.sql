begin;

alter table public.jobs
  add column fit_strong_alignment jsonb,
  add column fit_weak_spots       jsonb,
  add column fit_areas_to_probe   jsonb;

-- Each field must be null or a JSON array
alter table public.jobs
  add constraint jobs_fit_strong_alignment_is_array
  check (fit_strong_alignment is null or jsonb_typeof(fit_strong_alignment) = 'array');

alter table public.jobs
  add constraint jobs_fit_weak_spots_is_array
  check (fit_weak_spots is null or jsonb_typeof(fit_weak_spots) = 'array');

alter table public.jobs
  add constraint jobs_fit_areas_to_probe_is_array
  check (fit_areas_to_probe is null or jsonb_typeof(fit_areas_to_probe) = 'array');

commit;
