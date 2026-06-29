-- Schedule the email reminder function to run daily
-- Requires pg_cron extension to be enabled in Supabase dashboard

-- To schedule: every day at 8:00 AM
-- select cron.schedule('send-reminders', '0 8 * * *', $$
--   select net.http_post(
--     url := current_setting('supabase.url') || '/functions/v1/send-reminders',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('supabase.service_role_key')
--     )
--   ) as request_id;
-- $$);

-- Create the storage bucket for PDFs if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own PDFs
create policy "Users can upload their own PDFs"
on storage.objects for insert
with check (
  bucket_id = 'pdfs' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own PDFs
create policy "Users can read their own PDFs"
on storage.objects for select
using (
  bucket_id = 'pdfs' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);
