-- Brochure (folleto) per boiler/AC model
alter table public.boiler_models add column if not exists brochure_url text;

-- Public bucket for brochures
insert into storage.buckets (id, name, public)
values ('brochures', 'brochures', true)
on conflict (id) do nothing;

-- Authenticated users can upload/overwrite brochures
create policy "Users can upload brochures"
on storage.objects for insert
with check (bucket_id = 'brochures' and auth.role() = 'authenticated');

create policy "Users can update brochures"
on storage.objects for update
using (bucket_id = 'brochures' and auth.role() = 'authenticated');

create policy "Users can delete brochures"
on storage.objects for delete
using (bucket_id = 'brochures' and auth.role() = 'authenticated');
