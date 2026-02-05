begin;

alter table public.interview_sessions
  add column resume_file_id uuid not null references public.files(id);

commit;
