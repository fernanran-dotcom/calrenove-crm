-- Allow authenticated users to update boiler_models (required for setting
-- brochure_url when uploading brochures from the Folletos management page)
create policy "Users can update models" on public.boiler_models
for update using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
