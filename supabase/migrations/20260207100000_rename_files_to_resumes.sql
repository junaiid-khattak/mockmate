begin;

-- Rename table
alter table public.files rename to resumes;

-- Rename indexes
alter index files_storage_key_idx rename to resumes_storage_key_idx;
alter index files_bucket_storage_key_uq rename to resumes_bucket_storage_key_uq;

-- Rename RLS policies
alter policy "Files are readable by owner" on public.resumes
  rename to "Resumes are readable by owner";
alter policy "Files are insertable by owner" on public.resumes
  rename to "Resumes are insertable by owner";
alter policy "Files are updatable by owner" on public.resumes
  rename to "Resumes are updatable by owner";

commit;
