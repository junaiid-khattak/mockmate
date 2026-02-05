alter table public.files
  add column if not exists extracted_text text,
  add column if not exists extracted_text_status text not null default 'pending',
  add column if not exists extracted_text_error text,
  add column if not exists extracted_text_at timestamptz;
