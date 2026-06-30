-- Allow authenticated users to create brands and models (needed for "Otra marca")
create policy "Users can insert brands" on public.boiler_brands
  for insert with check (auth.role() = 'authenticated');

create policy "Users can insert models" on public.boiler_models
  for insert with check (auth.role() = 'authenticated');

-- Allow authenticated users to insert includes/excludes for models they created
create policy "Users can insert model includes" on public.model_includes
  for insert with check (auth.role() = 'authenticated');

create policy "Users can insert model excludes" on public.model_excludes
  for insert with check (auth.role() = 'authenticated');
