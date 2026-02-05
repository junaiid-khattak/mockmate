alter table public.files
  alter column storage_provider set default 's3';

create index if not exists files_storage_key_idx on public.files (storage_key);

create unique index if not exists files_bucket_storage_key_uq
  on public.files (bucket, storage_key);
