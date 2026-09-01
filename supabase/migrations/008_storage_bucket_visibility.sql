-- Storage policies needed for self-hosted Supabase (the base image does not
-- create visibility policies on storage.buckets, which breaks object INSERTs
-- because the FK check on bucket_id cannot see the parent row under RLS).

-- Allow authenticated users to see buckets (required for FK checks on objects.bucket_id)
create policy "Authenticated users can view buckets"
on storage.buckets for select
using (auth.role() = 'authenticated');

-- Allow authenticated users to read objects of the app buckets
create policy "Users can read brochure and pdf objects"
on storage.objects for select
using (
  bucket_id in ('brochures', 'pdfs')
  and auth.role() = 'authenticated'
);
